const express = require('express');
const router = express.Router();

router.post('/webhook', (req, res) => {
  try {
    res.sendStatus(200);
    
    const webhookData = req.body;
    console.log('Received Plaid webhook:', webhookData);
    switch (webhookData.webhook_type) {
     case 'TRANSACTIONS':
       break;
    }
  } catch (err) {
    console.error(`Error receiving webhook ${err.message}`);
    res.sendStatus(500);
  }
});

module.exports = router;