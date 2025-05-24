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

module.exports = {
  fetchAccounts,
  fetchTransactions,
  fetchInvestments
};