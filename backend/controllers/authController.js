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
      'select email from users where email = ?',
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
      html: `<h1>Your verification code:</h1>
             <h3>${code}</h3>`,
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

    await db.promise().execute('insert into users (email, password) values (?, ?)', [email, password]);
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
      return res.status(401).json({ error: 'Invalid password' });
    }

    const rawbankNames = rows.map(row => row.bank_name);
    const bankNames = rawbankNames.filter(n => n != null);
    const hasItem = !!bankNames.length;

    res.status(200).json({
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
    return res.sendStatus(200);
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
