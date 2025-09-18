'use strict';

require('dotenv').config({ path: '../.env' });
const { Worker } = require('worker_threads');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// routes
const accountRouter = require('./routes/accountRoutes');
const assetRouter = require('./routes/assetRoutes');
const authRouter = require('./routes/authRoutes');
const investmentRouter = require('./routes/investmentRoutes');
const plaidRouter = require('./routes/plaidRoutes');
const plaidWebhook = require('./routes/plaidWebhook');
const transactionRouter = require('./routes/transactionRoutes');

// setup
const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = isProd ? 443 : 5000;
const worker = new Worker(path.join(__dirname, 'helpers/plaidLinkWorker.js'));

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use('/api', accountRouter);
app.use('/api', assetRouter);
app.use('/api', authRouter);
app.use('/api', investmentRouter);
app.use('/api', plaidRouter);
app.use('/api', plaidWebhook);
app.use('/api', transactionRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// error handler
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(404).json({ error: 'not found' });
});

// if in production use https
let server;
if (isProd) {
  const key = fs.readFileSync(path.join(__dirname, 'certs', 'key.pem'));
  const cert = fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'));
  server = https.createServer({ key, cert }, app);

  server.on('clientError', (err, socket) => {
    console.error('Client error:', err.message);
    socket.destroy();
  });
} else {
  server = http.createServer(app);
}

// worker listeners
worker.on('message', (message) => {
  console.log(`Message from worker: ${message}`);
});

worker.on('error', (err) => {
  console.error('Worker thread error:', err);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Worker stopped with exit code ${code}`);
  }
});

// server init
server.listen(port, () => {
  console.log(`${isProd ? 'HTTPS' : 'HTTP'} server listening on port ${port}`);
});
