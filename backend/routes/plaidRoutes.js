const express = require('express');

const { createLinkToken, setAccessToken, getAccounts, 
  getTransactions, getInvestments, 
  getAssets, addAsset, removeAsset, getAll, 
  deleteItem, fireWebhook } = require('../controllers/plaidController');

const router = express.Router();

router.post('/create-link-token', createLinkToken);
router.post('/set-access-token', setAccessToken);

router.get('/accounts', getAccounts);

router.get('/transactions', getTransactions);

router.get('/investments', getInvestments);

router.get('/assets', getAssets);
router.post('/assets', addAsset);
router.delete('/assets', removeAsset);

router.get('/all', getAll);

router.delete('/delete-item', deleteItem);

router.post('/fire-webhook', fireWebhook);

module.exports = router;
