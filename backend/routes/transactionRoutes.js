const express = require('express');
const { 
  getTransactions, 
  addTransaction, 
  removeTransaction 
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/transactions', getTransactions);
router.post('/transactions', addTransaction);
router.delete('/transactions', removeTransaction);

module.exports = router;