const db = require('../config/db');
const client = require('../config/plaid');
const axios = require('axios');
const redis = require('../config/redis');
const verifyJwt = require('../helpers/verifyJwt');
const { fetchAccounts } = require('../queries/accountQueries');
const { fetchTransactions } = require('../queries/transactionQueries');
const { fetchInvestments } = require('../queries/investmentQueries');
const { fetchAssets } = require('../queries/assetQueries');


const createLinkToken = async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'user-id' },
      client_name: 'test plaid app',
      products: (process.env.PLAID_PRODUCTS).split(','),
      country_codes: (process.env.PLAID_COUNTRY_CODES).split(','),
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    });
    res.status(201).json(response.data);
  } catch (err) {
    console.error(`Error creating link token: ${err.message}`);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

const setAccessToken = async (req, res) => {
  const { public_token, email, user_token } = req.body;
  const startDate = '2000-01-01';
  const endDate = new Date().toISOString().split('T')[0];

  try {
    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    // get access token
    const tokenResponse = await client.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = tokenResponse.data;

    const [[userRow]] = await db.promise().execute('select id from users where email = ?', [email]);
    if (!userRow) return res.status(404).json({ message: 'User not found' });
    const user_id = userRow.id;

    let institutionName = 'Unknown Bank';
    const itemRes = await client.itemGet({ access_token });

    const institutionRes = await client.institutionsGetById({
      institution_id: itemRes.data.item.institution_id,
      country_codes: ['US'],
    });
    institutionName = institutionRes.data.institution.name;
    
    // store item in items
    await db.promise().execute(
      `insert into items
       (user_id, item_id, access_token, bank_name)
       values (?, ?, ?, ?)`,
      [user_id, item_id, access_token, institutionName]
    );

    const payload = JSON.stringify({
      access_token,
      user_id,
      item_id,
      institutionName,
      startDate,
      endDate,
      email
    });
    
    // delegate to worker
    await redis.rPush('sync_jobs', payload);

    res.status(202).json({ bank_name: institutionName });
  } catch (err) {
    console.error(`Error setting access token: ${err.message}`);
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

const getAll = async (req, res) => {
  try {
    const { email, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }
    
    const [transactions, investments, accounts, assets] = await Promise.all([
      fetchTransactions(email),
      fetchInvestments(email),
      fetchAccounts(email),
      fetchAssets(email),
    ]);

    res.status(200).json({ transactions, investments, accounts, assets });

    await db.promise().execute(
      `update users set needs_update = false where email = ?`,
      [email]
    );
  } catch (err) {
    console.error('Error fetching all', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

const deleteItem = async (req, res) => {
  try {
    const { bankName, email, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    // delete data in 1 promise
    const conn = db.promise();

    await conn.query('start transaction');
    // investment_transactions
    await conn.execute(`
      delete it
      from investment_transactions it
      join items i on it.item_id = i.item_id
      join users u on i.user_id = u.id
      where i.bank_name = ? and u.email = ?;
    `, [bankName, email]);

    // investments
    await conn.execute(`
      delete inv
      from investments inv
      join items i on inv.item_id = i.item_id
      join users u on i.user_id = u.id
      where i.bank_name = ? and u.email = ?;
    `, [bankName, email]);

    // transactions
    await conn.execute(`
      delete t
      from transactions t
      join items i on t.item_id = i.item_id
      join users u on i.user_id = u.id
      where i.bank_name = ? and u.email = ?;
    `, [bankName, email]);

    // accounts
    await conn.execute(`
      delete a
      from accounts a
      join items i on a.item_id = i.item_id
      join users u on i.user_id = u.id
      where i.bank_name = ? and u.email = ?;
    `, [bankName, email]);

    // item
    await conn.execute(`
      delete i
      from items i
      join users u on i.user_id = u.id
      where i.bank_name = ? and u.email = ?;
    `, [bankName, email]);

    await conn.query('commit');
    return res.sendStatus(204);
  } catch (err) {
    await conn.query('rollback');
    console.log('Error deleting item', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// simulate webhook from plaid
const fireWebhook = async (req, res) => {
  try {
    const { email } = req.body;
    const secret = process.env.PLAID_ENV === 'sandbox'
      ? process.env.PLAID_SECRET_SANDBOX
      : process.env.PLAID_SECRET_PRODUCTION
      
    const [rows] = await db.promise().query(
      `select access_token from items where user_id = (
        select id from users where email = ?
       )`,
      [email]
    );
    const token = rows[0]?.access_token;

    response = await axios.post('https://sandbox.plaid.com/sandbox/item/fire_webhook', {
      access_token: token,
      client_id: process.env.PLAID_CLIENT_ID,
      secret,
      webhook_type: 'TRANSACTIONS',
      webhook_code: 'DEFAULT_UPDATE',
    });

    if (response.data.webhook_fired) {
      res.sendStatus(200);
    } else {
      throw new Error('Webhook did not fire');
    }
  } catch (err) {
    console.error('Error firing webhook', err);
    res.sendStatus(500);
  }
}

module.exports = {
  createLinkToken,
  setAccessToken,
  getAll,
  deleteItem,
  fireWebhook,
};