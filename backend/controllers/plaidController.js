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
    console.log(`New link token created`);
    res.json(response.data);
  } catch (err) {
    console.error('Error creating link token:', err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

const setAccessToken = async (req, res) => {
  const { public_token, email } = req.body;

  try {
    const tokenResponse = await client.itemPublicTokenExchange({ public_token });
    const { access_token, item_id } = tokenResponse.data;

    const [userRows] = await db.promise().execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user_id = userRows[0].id;

    let institutionName = "Unknown Bank";
    const itemRes = await client.itemGet({ access_token });

    if (itemRes.data.item.institution_id) {
      const institutionRes = await client.institutionsGetById({
        institution_id: itemRes.data.item.institution_id,
        country_codes: ['US'],
      });

      institutionName = institutionRes.data.institution.name;
    }

    await db.promise().execute(
      `INSERT INTO items (user_id, item_id, access_token, bank_name) VALUES (?, ?, ?, ?)`,
      [user_id, item_id, access_token, institutionName]
    );

    res.json({ item_id, access_token, bank_name: institutionName });
  } catch (err) {
    console.error('Error setting access token:', err);
    res.status(500).json({ error: 'Token exchange failed' });
  }
};

const getTransactions = async (req, res) => {
  const email = req.query.email;
  try {
    // get id from email
    const [[{ id: userId = null } = {}]] = await db.promise().execute('SELECT id FROM users WHERE email = ?', [email]);

    if (!userId) return res.status(404).json({ message: 'User not found' });
    // get access_tokens from each item
    const [itemRows] = await db.promise().execute('SELECT access_token FROM items WHERE user_id = ?', [userId]);

    if (!itemRows.length)
      return res.status(404).json({ message: 'No linked accounts found' });

    // fetch every transaction
    const perItem = await Promise.all(
      itemRows.map(async ({ access_token }) => {
        // first /transactions/sync call (gets accounts + first page)
        let cursor   = null;
        let added    = [];
        let hasMore  = true;

        const firstPage = await client.transactionsSync({ access_token, cursor });
        cursor   = firstPage.data.next_cursor;
        added    = added.concat(firstPage.data.added);
        hasMore  = firstPage.data.has_more;

        // account map comes **free** in the same payload
        const accountMap = Object.fromEntries(
          firstPage.data.accounts.map(a => [
            a.account_id,
            a.name || a.official_name || 'Unnamed account',
          ]),
        );

        // keep paginating if necessary
        while (hasMore) {
          const { data } = await client.transactionsSync({ access_token, cursor });
          cursor   = data.next_cursor;
          added    = added.concat(data.added);
          hasMore  = data.has_more;
        }

        // b) one inexpensive /item/get for institution_id & name
        const {
          data: {
            item: { institution_id: instId, institution_name: instName = 'Unknown bank' },
          },
        } = await client.itemGet({ access_token });

        return { added, accountMap, instId, instName };
      }),
    );

    // 3. one institutions lookup per unique bank ----------------------------
    const instIds = new Set(perItem.map(x => x.instId).filter(Boolean));
    const namesFromApi = await fetchInstitutionNames(client, instIds); // see util above

    // 4. hydrate and flatten -------------------------------------------------
    const transactions = perItem.flatMap(({ added, accountMap, instId, instName }) =>
      added.map(tx => ({
        ...tx,
        account_name: accountMap[tx.account_id] || 'Unknown account',
        bank_name: namesFromApi[instId] || instName,
      })),
    );

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

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
  getTransactions,
  getInvestments,
};
