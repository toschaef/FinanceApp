'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// routes
const authRoutes = require('./routes/authRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const plaidWebhook = require('./routes/plaidWebhook');

// setup
const app = express();
const APP_PORT = process.env.APP_PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', plaidRoutes);
app.use('/api', plaidWebhook);

// dummy response, why not
app.use((req, res) => {
  res.status(200).json({ data: '😊' });
});

// error handler
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(404).json({ error: "not found" });
});

// server init
app.listen(APP_PORT, () => {
  console.log(`Server listening on port ${APP_PORT}`);
});
