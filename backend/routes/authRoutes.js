const express = require('express');
const rateLimit = require('express-rate-limit');
const { startRegistration, verifyAndRegister, login, changePassword} = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 10, // 10 login attempts per window
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 3, // 3 attempts per window
  message: { error: 'Too many verification attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-verification-email', startRegistration);
router.post('/verify-email', verifyLimiter, verifyAndRegister);
router.post('/login', loginLimiter, login);
router.patch('/update-password', changePassword);

module.exports = router;
