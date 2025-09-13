const express = require('express');
const { 
  createLinkToken,
  setAccessToken,
  getAll,
  deleteItem,
  fireWebhook
} = require('../controllers/plaidController');

const router = express.Router();

router.post('/create-link-token', createLinkToken);
router.post('/set-access-token', setAccessToken);
router.post('/fire-webhook', fireWebhook);

router.get('/all', getAll);

router.delete('/delete-item', deleteItem);

module.exports = router;
