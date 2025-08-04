'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

// routes
const authRoutes = require('./routes/authRoutes');
const plaidRoutes = require('./routes/plaidRoutes');
const plaidWebhook = require('./routes/plaidWebhook');

// setup
const app = express();
const APP_PORT = process.env.APP_PORT || 3000;

// https setup
const key = fs.readFileSync(path.join(__dirname, '../key.pem'));
const cert = fs.readFileSync(path.join(__dirname, '../cert.pem'));
const server = https.createServer({ key, cert }, app);

server.on('clientError', (err, socket) => {
  console.error('Client error:', err.message);
  socket.destroy();
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use('/api', authRoutes);
app.use('/api', plaidRoutes);
app.use('/api', plaidWebhook);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// dummy response, why not
app.use((req, res) => {
  res.status(200).json({ data: '😊' });
});

// error handler
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(404).json({ error: 'not found' });
});

// server init
server.listen(APP_PORT, () => {
  console.log(`Server listening on port ${APP_PORT}`);
});
