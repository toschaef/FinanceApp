const express = require('express');
const { register, verifyAndRegister, login, verifyCode } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-and-register', verifyAndRegister);
router.post('/login', login);
router.post('/verify', verifyCode);

module.exports = router;
