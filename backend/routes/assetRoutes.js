const express = require('express');
const { 
  getAssets, 
  addAsset, 
  removeAsset 
} = require('../controllers/assetController');

const router = express.Router();

router.get('/assets', getAssets);
router.post('/assets', addAsset);
router.delete('/assets', removeAsset);

module.exports = router;