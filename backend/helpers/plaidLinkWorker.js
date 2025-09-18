const { isMainThread, parentPort } = require('worker_threads');
const db = require('../config/db');
const client = require('../config/plaid');
const redis = require('../config/redis');
const sandboxCoords = require('../helpers/sandboxCoords');
const financeCategoryMap = require('./financeCategoryMap');

const plaidLinkWorker = async () => {
  try {
  while(true) {
    const job = await redis.blPop('sync_jobs', 0);

    if (!job) continue;

    const jobKey = job.element;
    const { access_token, user_id, item_id, institutionName, startDate, endDate, email } = JSON.parse(jobKey);

    try {
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
          account.mask,
        ]);
        await db.promise().query(
          `insert into accounts
           (account_id, user_id, item_id, account_balance, iso_currency_code, account_name, account_type, account_subtype, institution_name, mask)
           values ?`,
          [accountValues]
        );
      }

      const accountMap = Object.fromEntries(
        accounts.map(a => [a.account_id, { name: a.name, mask: a.mask }])
      );

      const transactionsResponse = await client.transactionsGet({ access_token, start_date: startDate, end_date: endDate });
      const transactions = transactionsResponse.data.transactions;
      if (transactions.length > 0) {
        // might need dedicated geocoding worker if this is slow in prod
        const transactionData = await Promise.all(
          transactions.map(async txn => {
            let lat = txn.location.lat;
            let lng = txn.location.lon;
            // handle missing coords
            if (process.env.PLAID_ENV === 'production' && 
                (!lat || !lng)) {
              const addressParts = [
                txn.location.address,
                txn.location.city,
                txn.location.region,
                txn.location.postal_code,
                txn.location.country,
              ].filter(Boolean);
              
              if (addressParts.length > 0) {
                const fullAddress = addressParts.join(', ');
                const coords = await geocodeAddress(fullAddress);
                if (coords) {
                  lat = coords.lat;
                  lng = coords.lng;
                }
              }
            } else if (!lat || !lng) {
              // sandbox gets random coords
              const randomCoord = sandboxCoords[Math.floor(Math.random() * sandboxCoords.length)];
              lat = randomCoord.lat;
              lng = randomCoord.lng;
            }
            return [
              user_id,
              item_id,
              txn.account_id,
              txn.amount,
              txn.merchant_name || txn.name || 'Transaction',
              txn.iso_currency_code,
              txn.date,
              accountMap[txn.account_id].name || 'Unknown Account',
              txn.payment_channel || 'unresolved',
              txn.transaction_code || '',
              institutionName,
              financeCategoryMap[txn.personal_finance_category.primary] || '', // transaction type
              accountMap[txn.account_id].mask || '----',
              lat,
              lng,
            ];
          })
        );
        await db.promise().query(
          `insert into transactions
           (user_id, item_id, account_id, amount, transaction_name, iso_currency_code, transaction_date, account_name, payment_channel, transaction_subtype, institution_name, finance_category, mask, lat, lng)
           values ?`,
          [transactionData]
        );
      }

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
            accountMap[inv.account_id].name || 'Unknown Account',
            accountMap[inv.account_id].mask || '----',
          ];
        });

        await db.promise().query(
          `insert into investments
           (user_id, item_id, account_id, security_id, quantity, institution_price, institution_value, iso_currency_code, investment_name, ticker_symbol, institution_name, account_name, mask)
           values ?`,
          [investmentData]
        );
      }

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

      await db.promise().execute(
        `update users set needs_update = true where email = ?`,
        [email]
      );
    } catch (err) {
      console.error(`Error processing job for user ${email}: ${err.message}`);
    }
  }
} catch (err) {
  console.log('error in thread', err);
}
};  

if (!isMainThread) {
  plaidLinkWorker();
}