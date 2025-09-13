const express = require('express');
const { 
  getAccounts, 
  addAccount, 
  removeAccount 
} = require('../controllers/accountController');

const router = express.Router();

router.get('/accounts', getAccounts);
router.post('/accounts', addAccount);
router.delete('/accounts', removeAccount);

module.exports = router;