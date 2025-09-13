const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
require('dotenv').config();

const secret = process.env.PLAID_ENV === 'production'
  ? process.env.PLAID_SECRET_PRODUCTION
  : process.env.PLAID_SECRET_SANDBOX

try {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': secret,
        'Plaid-Version': '2020-09-14',
      },
    },
  });
  const client = new PlaidApi(configuration);

  console.log('Plaid client connected');

  module.exports = client;    
} catch (err) {
  console.log(`Plaid startup error: ${err.message}`)
}
