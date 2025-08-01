const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  connectTimeout: 100000, // my laptop is really slow
});

db.connect((err) => {
  if (err) {
    console.error(`DB failed: ${err.message}`);
  } else {
    console.log('DB connected');
  }
});

module.exports = db;
