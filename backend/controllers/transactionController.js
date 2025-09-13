const verifyJwt = require('../helpers/verifyJwt');
const {
  fetchTransactions,
  postTransaction,
  deleteTransaction
} = require('../queries/transactionQueries');

const getTransactions = async (req, res) => {
  try {
    const { email, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    const transactions = await fetchTransactions(email);
    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

const addTransaction = async (req, res) => {
  try {
    const { email, user_token } = req.body;

    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }

    await postTransaction(req.body);
    res.sendStatus(201);
  } catch (err) {
    console.error('Error adding transaction', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removeTransaction = async (req, res) => {
  try {
    const { email, id, user_token } = req.query;

    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }

    await deleteTransaction({ email, id });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting transaction', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  removeTransaction,
}