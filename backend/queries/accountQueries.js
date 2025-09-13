const db = require('../config/db');

const fetchAccounts = async (email) => {
  const [accounts] = await db.promise().execute(
    `select * from accounts where user_id = (
       select id from users where email = ?
     )`, [email]
  );
  return accounts;
}

const postAccount = async (data) => {
  const values = [
    data.item_id,
    data.account_id,
    data.account_balance || 0,
    data.iso_currency_code || 'USD',
    data.account_name,
    data.account_type,
    data.account_subtype,
    data.institution_name,
    data.mask,
    data.email,
  ];

  await db.promise().execute(
    `insert into accounts (
      item_id,
      account_id,
      account_balance,
      iso_currency_code,
      account_name,
      account_type,
      account_subtype,
      institution_name,
      mask,
      user_id
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, (select id from users where email = ?))`,
    values
  );
};

const deleteAccount = async (data) => {
  await db.promise().execute(
    `delete from accounts where account_id = ? and user_id = (
      select id from users where email = ?
    )`,
    [data.id, data.email]
  );
};

module.exports = {
  fetchAccounts,
  postAccount,
  deleteAccount,
}