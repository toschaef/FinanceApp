const express = require('express');
const { startRegistration, verifyAndRegister, login, changePassword} = require('../controllers/authController');

const router = express.Router();

router.post('/send-verification-email', startRegistration);
router.post('/verify-email', verifyAndRegister);
router.post('/login', login);
router.patch('/update-password', changePassword);

module.exports = router;
