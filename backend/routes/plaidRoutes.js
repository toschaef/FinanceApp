const express = require('express');
const { createLinkToken, setAccessToken, getAccounts, getTransactions, getInvestments, deleteItem } = require('../controllers/plaidController');

const router = express.Router();

// router.post('/info', (req, res) => {
//     res.json({ products: process.env.PLAID_PRODUCTS.split(',') });
//     });
router.post('/create-link-token', createLinkToken);
router.post('/set-access-token', setAccessToken);
router.get('/accounts', getAccounts);
router.get('/transactions', getTransactions);
router.get('/investments', getInvestments);
router.delete('/delete-item', deleteItem);

module.exports = router;
