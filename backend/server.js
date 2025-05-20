'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// setup
const app = express();
const APP_PORT = process.env.APP_PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// routes
const authRoutes = require('./routes/authRoutes');
const plaidRoutes = require('./routes/plaidRoutes');

app.use('/api', authRoutes);
app.use('/api', plaidRoutes);

// error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(404).json({ error: "not found" });
});

// server init
app.listen(APP_PORT, () => {
  console.log(`Server listening on port ${APP_PORT}`);
});
