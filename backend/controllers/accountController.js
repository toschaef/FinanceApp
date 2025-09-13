const verifyJwt = require('../helpers/verifyJwt');
const {
  fetchAccounts,
  postAccount,
  deleteAccount
} = require('../queries/accountQueries');

const getAccounts = async (req, res) => {
  try {
    const { email, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    const accounts = await fetchAccounts(email);
    res.status(200).json({ accounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
}

const addAccount = async (req, res) => {
  try {
    const { email, user_token } = req.body;

    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }

    await postAccount(req.body);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Error adding account', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removeAccount = async (req, res) => {
  try {
    const { email, id, user_token } = req.query;

    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }

    await deleteAccount({ email, id });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting account', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getAccounts,
  addAccount,
  removeAccount,
}