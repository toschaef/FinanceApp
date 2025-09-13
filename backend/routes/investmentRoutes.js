const express = require('express');
const { 
  getInvestments, 
  addInvestment, 
  removeInvestment 
} = require('../controllers/investmentController');

const router = express.Router();

router.get('/investments', getInvestments);
router.post('/investments', addInvestment);
router.delete('/investments', removeInvestment);

module.exports = router;