const db = require('../config/db');
const redis = require('../config/redis');
const transporter = require('../config/email');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');
const generateCode = require('../helpers/codeGenerator');
const verifyJwt = require('../helpers/verifyJwt');

// send verification code to user and hash password (if registering)
const startRegistration = async (req, res) => {
  const { 
    email, 
    password, 
    register, // if registering block duplicate emails
  } = req.body;

  const encrypt = async (pass) => {
    const hashedPass = await bcrypt.hash(pass, 10);
    return hashedPass;
  }

  try {
    const [rows] = await db.promise().execute(
      'select email from users where email = ?',
      [email]
    );

    if (rows.length !== 0 && register) {
      return res.status(409).json({ error: 'Account exists with email' });
    }

    const code = generateCode();
    const encryptedPassword = await encrypt(password);
    console.log(`\nCode for ${email}: ${code}`);
    await redis.set(`verify:${email}:${code}`, encryptedPassword, { EX: 300 });

    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Your Verification Code',
      html: `<h1>Your verification code:</h1>
             <h3>${code}</h3>`,
    });

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error(`Registration error: ${err.message}`);
    res.status(500).json({ error: 'Could not initiate verification' });
  }
};
// register and/or verify email code
const verifyAndRegister = async (req, res) => {
  const { 
    email, 
    code, 
    register, // if register: register user in db, else: skip and just verify
  } = req.body;

  const key = `verify:${email}:${code}`;

  try {
    const password = await redis.get(key);
    if (!password) return res.status(400).json({ message: 'Invalid or expired code' });
    if (Boolean(register)) {
      await db.promise().execute(
        'insert into users (email, password) values (?, ?)',
        [email, password]
      );
    }
    await redis.del(key);

    const user_token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '3h' });

    res.status(201).json({ user_token });
  } catch (err) {
    console.error(`Verification error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// login and respond with array of bank names and jwt
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.promise().execute(
      `select u.id, u.email, u.password, i.bank_name 
       from users u 
       left join items i on u.id = i.user_id 
       where u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: 'Email not registered' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid Username or Password' });
    }

    const rawbankNames = rows.map(row => row.bank_name);
    const bankNames = rawbankNames.filter(n => n != null);
    const hasItem = !!bankNames.length;

    const user_token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({
        email: user.email,
        hasItem,
        bankNames,
        user_token,
    });

    await db.promise().execute(
      `update users set needs_update = false where email = ?`,
      [email]
    );
  } catch (err) {
    console.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const changePassword = async (req, res) => {
  const { email, pass, user_token } = req.body.perams;

  const encrypt = async (pass) => {
    const hashedPass = await bcrypt.hash(pass, 10);
    return hashedPass;
  }

  try { 
    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    const encryptedPass = await encrypt(pass);
    await db.promise().execute(
      `update users
       set password = ?
       where email = ?`, [encryptedPass, email]);
    res.sendStatus(204);
  } catch (err) {
    console.error(`Error updating password: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// reissues jwt if expiring in under 1 min
const updateJwtIfNeeded = (user_token, email) => {
  const decoded = jwtDecode(user_token);
  expires = new Date(decoded.exp * 1000);
  const now = Date.now();
  const timeRemaining = expires - now;
  if (timeRemaining < 60 * 1000) { // < 1 min
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  }
  return user_token;
};

/* 
    sends bool representing if user needs to update their data
    also reissues jwt if expiring 
*/
const checkStatus = async (req, res) => {
  let { email, user_token } = req.query;
  try {
    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    // reissues jwt if expiring in under 1 min
    user_token = updateJwtIfNeeded(user_token, email);

    const [rows] = await db.promise().execute(
      `select needs_update from users where email = ?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const needs_update = rows[0].needs_update;

    res.status(200).json({ needs_update, user_token });
  } catch (err) {
    console.error(`Error checking status: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  startRegistration,
  verifyAndRegister,
  login,
  changePassword,
  checkStatus,
};
