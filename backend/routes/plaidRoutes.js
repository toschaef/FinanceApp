const express = require('express');
const { createLinkToken, setAccessToken, getAccounts, getTransactions, getInvestments, getAll, deleteItem } = require('../controllers/plaidController');

const router = express.Router();

router.post('/create-link-token', createLinkToken);
router.post('/set-access-token', setAccessToken);
router.get('/accounts', getAccounts);
router.get('/transactions', getTransactions);
router.get('/investments', getInvestments);
router.get('/all', getAll);
router.delete('/delete-item', deleteItem);

module.exports = router;
