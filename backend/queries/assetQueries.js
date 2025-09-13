const db = require('../config/db');

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
  fetchAssets,
  postAsset,
  deleteAsset,
}