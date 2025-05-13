const db = require('../config/db');
const redis = require('../config/redis');
const transporter = require('../config/email');
const bcrypt = require('bcrypt');
const generateCode = require('../helpers/codeGenerator');

// send verification code to user
const register = async (req, res) => {
  const { email, password } = req.body;

  const encrypt = async (pass) => {
    const hashedPass = await bcrypt.hash(pass, 10);
    return hashedPass;
  }

  try {
    const [rows] = await db.promise().execute(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (rows.length !== 0) {
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
      html: `<h1>${code}</h1>`,
    });

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Could not initiate verification' });
  }
};
// register user in db once code is verified
const verifyAndRegister = async (req, res) => {
  const { email, code } = req.body;
  const key = `verify:${email}:${code}`;

  try {
    const password = await redis.get(key);
    if (!password) return res.status(400).json({ message: 'Invalid or expired code' });

    await db.promise().execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
    await redis.del(key);

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.promise().execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(409).json({ error: 'Email not registered' });
    }
    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const [itemRows] = await db.promise().execute(
      'SELECT bank_name FROM items WHERE user_id = ?',
      [user.id]
    );
    
    const hasItem = itemRows.length > 0;
    const bankNames = itemRows.map(row => row.bank_name).filter(Boolean);

    res.json({
      message: 'Login successful',
      user: {
        email: user.email,
        hasItem,
        bankNames,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

const verifyCode = async (req, res) => {
  const { code, email } = req.body;
  const key = `verify:${email}:${code}`;

  try {
    const encryptedPassword = await redis.get(key);
    if (!encryptedPassword) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    res.json({ isEqual: true });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification error' });
  }
};

module.exports = {
  register,
  verifyAndRegister,
  login,
  verifyCode,
};
