const express = require('express');
const { createLinkToken, setAccessToken, getAccounts, getTransactions, getInvestments } = require('../controllers/plaidController');

const router = express.Router();

router.post('/info', (req, res) => {
    res.json({ products: process.env.PLAID_PRODUCTS.split(',') });
    });
router.post('/create_link_token', createLinkToken);
router.post('/set_access_token', setAccessToken);
router.get('/accounts', getAccounts);
router.get('/transactions', getTransactions);
router.get('/investments', getInvestments);

module.exports = router;
