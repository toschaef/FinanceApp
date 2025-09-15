const db = require('../config/db');

const fetchTransactions = async (email) => {
  const [transactions] = await db.promise().execute(
    `select * from transactions where user_id = (
       select id from users where email = ?
     ) order by transaction_date desc`, [email]
  );
  return transactions;
}

const postTransaction = async (data) => {
  const values = [
    data.item_id || null,
    data.account_id || null,
    data.amount,
    data.merchant_name || data.transaction_name || 'Transaction' ,
    data.iso_currency_code || 'USD',
    data.transaction_date || null,
    data.account_name || 'Account',
    data.payment_channel || null,
    data.transaction_subtype || null,
    data.institution_name || 'Bank',
    data.finance_category || 'Uncategorized',
    data.mask || '----',
    data.lat || null,
    data.lng || null,
    data.email,
  ];

  await db.promise().execute(
    `insert into transactions (
      item_id,
      account_id,
      amount,
      transaction_name,
      iso_currency_code,
      transaction_date,
      account_name,
      payment_channel,
      transaction_subtype,
      institution_name,
      finance_category,
      mask,
      lat,
      lng,
      user_id
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (select id from users where email = ?))`,
    values
  );
};

const deleteTransaction = async (data) => {
  await db.promise().execute(
    `delete from transactions where id = ? and user_id = (
      select id from users where email = ?
    )`,
    [data.id, data.email]
  );
};

module.exports = {
  fetchTransactions,
  postTransaction,
  deleteTransaction,
}