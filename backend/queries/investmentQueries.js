const db = require('../config/db');

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

const postInvestment = async (data) => {
  const values = [
    data.item_id,
    data.account_id,
    data.security_id,
    data.quantity || 0,
    data.institution_price || 0,
    data.institution_value || 0,
    data.iso_currency_code || 'USD',
    data.investment_name,
    data.ticker_symbol,
    data.institution_name,
    data.account_name,
    data.mask,
    data.email,
  ];

  await db.promise().execute(
    `insert into investments (
      item_id,
      account_id,
      security_id,
      quantity,
      institution_price,
      institution_value,
      iso_currency_code,
      investment_name,
      ticker_symbol,
      institution_name,
      account_name,
      mask,
      user_id
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, (select id from users where email = ?))`,
    values
  );
};

const deleteInvestment = async (data) => {
  await db.promise().execute(
    `delete from investments where id = ? and user_id = (
      select id from users where email = ?
    )`,
    [data.id, data.email]
  );
};

module.exports = {
  fetchInvestments,
  postInvestment,
  deleteInvestment,
}