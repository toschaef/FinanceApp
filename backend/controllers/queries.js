const db = require('../config/db');

const fetchAccounts = async (email) => {
  const [accounts] = await db.promise().execute(
    `select * from accounts where user_id = (
       select id from users where email = ?
     )`, [email]
  );
  return accounts;
}

const fetchTransactions = async (email) => {
  const [transactions] = await db.promise().execute(
    `select * from transactions where user_id = (
       select id from users where email = ?
     ) order by transaction_date desc`, [email]
  );
  return transactions;
}

const fetchInvestments = async (email) => {
  const [investments] = await db.promise().execute(
    `select * from investments where user_id = (
       select id from users where email = ?
     )`, [email]
  );

  for (let investment of investments) {
    const [transactions] = await db.promise().execute(
      `select * from investment_transactions where user_id = (
         select id from users where email = ?
       ) and security_id = ? order by transaction_date desc`, [email, investment.security_id]
    );
    investment.transactions = transactions;
  }
  return investments;
}

const fetchAssets = async (email) => {
  const [assets] = await db.promise().execute(
    `select * from assets where user_id = (
       select id from users where email = ?
    ) order by acquisition_date desc`, [email]
  );
  return assets;
}

const postAsset = async (data) => {
  const quantity = Number(data.quantity) || 1;
  const amount = quantity * Number(data.estimated_value);
  const values = [
    data.estimated_value,
    quantity,
    data.asset_name,
    data.acquisition_date || null,
    data.iso_currency_code || 'USD',
    data.description || null,
    amount,
    data.email
  ]

  await db.promise().execute(
    `insert into assets (
     estimated_value,
     quantity,
     asset_name,
     acquisition_date,
     iso_currency_code,
     bio,
     amount,
     user_id
    ) values (?, ?, ?, ?, ?, ?, ?, (select id from users where email = ?))`, values);
}

const deleteAsset = async (data) => {
  await db.promise().execute(
    `delete from assets where id = ? and user_id = (
      select id from users where email = ?
    )`,
    [data.id, data.email]
  );
}

module.exports = {
  fetchAccounts,
  fetchTransactions,
  fetchInvestments,
  fetchAssets,
  postAsset,
  deleteAsset,
};