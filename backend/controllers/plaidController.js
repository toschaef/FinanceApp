const db = require('../config/db');
const client = require('../config/plaid');
require('dotenv').config();
const { fetchAccounts, fetchTransactions, fetchInvestments, fetchAssets, postAsset, deleteAsset } = require('./queries');

const createLinkToken = async (req, res) => {
  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: 'user-id' },
      client_name: 'test plaid app',
      products: (process.env.PLAID_PRODUCTS).split(','),
      country_codes: (process.env.PLAID_COUNTRY_CODES).split(','),
      language: 'en',
    });
    console.log(`\nNew link token created`);
    res.status(201).json(response.data);
  } catch (err) {
    console.error('Error creating link token:', err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

const setAccessToken = async (req, res) => {
  const { public_token, email } = req.body;
  const startDate = '2000-01-01';
  const endDate = new Date().toISOString().split('T')[0];

  try {
    // get access token
    const tokenResponse = await client.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = tokenResponse.data;

    const [[userRow]] = await db.promise().execute('select id from users where email = ?', [email]);
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
      `insert into items
       (user_id, item_id, access_token, bank_name)
       values (?, ?, ?, ?)`,
      [user_id, item_id, access_token, institutionName]
    );

    const accountsResponse = await client.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;

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

      await db.promise().query(
        `insert into accounts
         (account_id, user_id, item_id, account_balance, iso_currency_code, account_name, account_type, account_subtype, institution_name)
          values ?`,
        [accountValues]
      );
    }
    console.log('inserted accounts');

    const accountMap = Object.fromEntries(
      accounts.map(a => [a.account_id, a.name])
    );

    // store transactions in transactions
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

      await db.promise().query(
        `insert into transactions
         (user_id, item_id, account_id, amount, transaction_name, iso_currency_code, transaction_date, account_name, payment_channel, transaction_subtype, institution_name)
         values ?`,
        [transactionData]
      );
    }
    console.log('inserted transactions');

    const investmentsResponse = await client.investmentsHoldingsGet({ access_token });

    const investments = investmentsResponse.data.holdings;
    const securities = investmentsResponse.data.securities;

    const securityData = {};
    for (const s of securities) {
      securityData[s.security_id] = {
        name: s.name,
        ticker_symbol: s.ticker_symbol || ''
      };
    }

    if (investments.length > 0) {
      const investmentData = investments.map(inv => {
        const s = securityData[inv.security_id]
        return [
          user_id,
          item_id,
          inv.account_id,
          inv.security_id,
          inv.quantity,
          inv.institution_price,
          inv.institution_value,
          inv.iso_currency_code,
          s.name,
          s.ticker_symbol || '',
          institutionName,
          accountMap[inv.account_id] || 'Unknown Account',
        ];
      });

      await db.promise().query(
        `insert into investments
         (user_id, item_id, account_id, security_id, quantity, institution_price, institution_value, iso_currency_code, investment_name, ticker_symbol, institution_name, account_name)
         values ?`,
        [investmentData]
      );
    }
    console.log('inserted investments');

    const investmentTransactionsResponse = await client.investmentsTransactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
    });

    const investmentTransactions = investmentTransactionsResponse.data.investment_transactions;

    if (investmentTransactions.length > 0) {
      const investmentTransactionData = investmentTransactions.map(itxn => [
        user_id,
        item_id,
        itxn.account_id,
        itxn.investment_transaction_id,
        itxn.security_id,
        itxn.type,
        itxn.subtype,
        itxn.date,
        itxn.amount,
        itxn.price,
        itxn.quantity,
        itxn.iso_currency_code,
      ]);

      await db.promise().query(
        `insert into investment_transactions
         (user_id, item_id, account_id, investment_transaction_id, security_id, type, subtype, transaction_date, amount, price, quantity, iso_currency_code)
         values ?`,
        [investmentTransactionData]
      );
    }
    console.log('inserted investment transactions');

    res.status(201).json({ bank_name: institutionName });
  } catch (err) {
    console.error('Error setting access token:', err);
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await fetchAccounts(req.query.email);
    res.status(200).json({ accounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
}

const getTransactions = async (req, res) => {
  try {
    const transactions = await fetchTransactions(req.query.email);
    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

const getInvestments = async (req, res) => {
  try {
    const investments = await fetchInvestments(req.query.email);
    res.status(200).json({ investments });
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

const getAssets = async (req, res) => {
  try {
    const assets = await fetchAssets(req.query.email);
    res.status(200).json({ assets })
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: 'Failed to fetch investments' })
  }
}

const addAsset = async (req, res) => {
  try {
    await postAsset(req.body);
    res.status(201).json({ message: 'Asset created successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error'});
  }
}

const removeAsset = async (req, res) => {
  try {
    const { email, id } = req.query;
    await deleteAsset({ email, id });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting asset', err);
    res.status(500).json({ error: 'Internal Server Error'})
  }
}

const getAll = async (req, res) => {
  const email = req.query.email;
  try {
    const [transactions, investments, accounts, assets] = await Promise.all([
      fetchTransactions(email),
      fetchInvestments(email),
      fetchAccounts(email),
      fetchAssets(email),
    ]);

    res.status(200).json({ transactions, investments, accounts, assets });
  } catch (err) {
    console.error('Error fetching all', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

const deleteItem = async (req, res) => {
  const { bankName, email } = req.query;

  if (!bankName || !email) {
    return res.status(400).json({ error: "bankName and email are required" });
  }

  const conn = db.promise();

  try {
    await conn.query("start transaction");
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

    await conn.query("commit");
    return res.sendStatus(204);
  } catch (err) {
    await conn.query("rollback");
    console.log('Error deleting item', err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createLinkToken,
  setAccessToken,
  getAccounts,
  getTransactions,
  getInvestments,
  getAssets,
  addAsset,
  removeAsset,
  getAll,
  deleteItem,
};