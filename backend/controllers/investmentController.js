const verifyJwt = require('../helpers/verifyJwt');
const {
  fetchInvestments,
  postInvestment,
  deleteInvestment
} = require('../queries/investmentQueries');

const getInvestments = async (req, res) => {
  try {
    const { email, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    const investments = await fetchInvestments(email);
    res.status(200).json({ investments });
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
};

const addInvestment = async (req, res) => {
  try {
    const { email, user_token } = req.body;

    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }

    await postInvestment(req.body);
    res.status(201).json({ message: 'Investment created successfully' });
  } catch (err) {
    console.error('Error adding investment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removeInvestment = async (req, res) => {
  try {
    const { email, id, user_token } = req.query;

    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' });
    }

    await deleteInvestment({ email, id });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting investment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getInvestments,
  addInvestment,
  removeInvestment,
}