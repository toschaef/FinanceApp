const db = require('../config/db');
const client = require('../config/plaid');
const fetchInstitutionNames = require('../helpers/fetchInstitutionNames')
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const createLinkToken = async (req, res) => {
  try {
    const configs = {
      user: { client_user_id: 'user-id' },
      client_name: 'test plaid app',
      products: (process.env.PLAID_PRODUCTS || 'transactions,investment').split(','),
      country_codes: (process.env.PLAID_COUNTRY_CODES || 'US').split(','),
      language: 'en',
    };

    const response = await client.linkTokenCreate(configs);
    console.log(`\nNew link token created`);
    res.json(response.data);
  } catch (err) {
    console.error('Error creating link token:', err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

const setAccessToken = async (req, res) => {
  const { public_token, email } = req.body;

  try {
    // get access token
    const tokenResponse = await client.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = tokenResponse.data;

    const [[userRow]] = await db.promise().execute('SELECT id FROM users WHERE email = ?', [email]);
    if (!userRow) return res.status(404).json({ message: 'User not found' });
    const user_id = userRow.id;

    let institutionName = "Unknown Bank";
    const itemRes = await client.itemGet({ access_token });

    const institutionRes = await client.institutionsGetById({
      institution_id: itemRes.data.item.institution_id,
      country_codes: ['US'],
    });
    institutionName = institutionRes.data.institution.name;
    
    // store item in items
    await db.promise().execute(
      `insert into items (user_id, item_id, access_token, bank_name) values (?, ?, ?, ?)`,
      [user_id, item_id, access_token, institutionName]
    );

    const response = await client.accountsGet({ access_token });
    const accounts = response.data.accounts;

    if (accounts.length > 0) {
      const accountValues = accounts.map(account => [
        account.account_id,
        user_id,
        item_id,
        account.balances.current,
        account.balances.iso_currency_code,
        account.name,
        account.type,
        account.subtype,
        institutionName,
      ]);
    
      const query = `insert into accounts (account_id, user_id, item_id, account_balance, iso_currency_code, account_name, account_type, account_subtype, institution_name) values ?`;

      await db.promise().query(query, [accountValues]);
    }
    console.log('\ninserted accounts');

    const accountMap = Object.fromEntries(
      accounts.map(a => [a.account_id, a.name])
    );

    // store transactions in transactions
    const startDate = '2000-01-01';
    const endDate = new Date().toISOString().split('T')[0];

    const transactionsResponse = await client.transactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
    });

    const transactions = transactionsResponse.data.transactions;

    if (transactions.length > 0) {
      const transactionData = transactions.map(txn => [
        user_id,
        item_id,
        txn.account_id,
        txn.amount,
        txn.name,
        txn.iso_currency_code,
        txn.date,
        accountMap[txn.account_id] || 'Unknown Account',
        txn.payment_channel || 'unresolved',
        txn.transaction_code || '',
        institutionName,
      ]);
      const query = `insert into transactions (user_id, item_id, account_id, amount, transaction_name, iso_currency_code, transaction_date, account_name, payment_channel, transaction_subtype, institution_name) values ?`;
      await db.promise().query(query, [transactionData]);
    }
    console.log('inserted transactions');

    res.json({ bank_name: institutionName });
  } catch (err) {
    console.error('Error setting access token:', err);
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

const getAccounts = async (req, res) => {
  const email = req.query.email;
  try {
    const [[{ id: userId = null } = {}]] = await db.promise().execute('select id from users where email = ?', [email]);

    if (!userId) return res.status(404).json({ message: 'User not found' });

    // fetch every account
    const [accounts] = await db.promise().execute(
      'SELECT * FROM accounts WHERE user_id = ?',
      [userId]
    );

    res.json({ accounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
}

const getTransactions = async (req, res) => {
  const email = req.query.email;
  try {
    const [[{ id: userId = null } = {}]] = await db.promise().execute('select id from users where email = ?', [email]);

    if (!userId) return res.status(404).json({ message: 'User not found' });

    // fetch transactions
    const [transactions] = await db.promise().execute(
      'select * from transactions where user_id = ?',
      [userId]
    );

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
}

const getInvestments = async (req, res) => {
  const email = req.query.email;

  try {
    const [userRows] = await db.promise().execute('SELECT id FROM users WHERE email = ?', [email]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user_id = userRows[0].id;
    const [itemRows] = await db.promise().execute('SELECT access_token FROM items WHERE user_id = ?', [user_id]);
    if (itemRows.length === 0) {
      return res.status(404).json({ message: 'No linked accounts found' });
    }

    const allHoldings = [];

    for (const { access_token } of itemRows) {
      // fetch account name
      const accountsRes = await client.accountsGet({ access_token });
      const accountMap = {};
      for (const acc of accountsRes.data.accounts) {
        accountMap[acc.account_id] = acc.name || acc.official_name || "Unnamed Account";
      }

      // fetch institiution name
      const itemRes = await client.itemGet({ access_token });
      let institutionName = "Unknown Bank";
      if (itemRes.data.item.institution_id) {
        const institutionRes = await client.institutionsGetById({
          institution_id: itemRes.data.item.institution_id,
          country_codes: ['US'],
        });
        institutionName = institutionRes.data.institution.name;
      }

      // fetch holdings
      const holdingsRes = await client.investmentsHoldingsGet({ access_token });
      const holdings = holdingsRes.data.holdings;
      const securities = holdingsRes.data.securities;

      const securityMap = {};
      for (const sec of securities) {
        securityMap[sec.security_id] = sec;
      }

      for (const holding of holdings) {
        const security = securityMap[holding.security_id] || {};
        allHoldings.push({
          ...holding,
          ...security,
          account_name: accountMap[holding.account_id] || "Unknown Account",
          bank_name: institutionName,
        });
      }
    }

    res.json({ investments: allHoldings });
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ message: 'Failed to fetch investments' });
  }
};
  

module.exports = {
  createLinkToken,
  setAccessToken,
  getAccounts,
  getTransactions,
  getInvestments,
};
