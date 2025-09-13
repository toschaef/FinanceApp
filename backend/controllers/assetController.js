const verifyJwt = require('../helpers/verifyJwt');
const {
  fetchAssets,
  postAsset,
  deleteAsset
} = require('../queries/assetQueries');

const getAssets = async (req, res) => {
  try {
    const { email, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    const assets = await fetchAssets(email);
    res.status(200).json({ assets })
  } catch (err) {
    console.error('Error fetching assets:', err);
    res.status(500).json({ error: 'Failed to fetch investments' })
  }
}

const addAsset = async (req, res) => {
  try {
    const { email, user_token } = req.body;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    await postAsset(req.body);
    res.status(201).json({ message: 'Asset created successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error'});
  }
}

const removeAsset = async (req, res) => {
  try {
    const { email, id, user_token } = req.query;

    // check for valid jwt
    if (!verifyJwt(user_token, email)) {
      return res.status(401).json({ error: 'Invalid JWT' })
    }

    await deleteAsset({ email, id });
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting asset', err);
    res.status(500).json({ error: 'Internal Server Error'})
  }
}

module.exports = {
  getAssets,
  addAsset,
  removeAsset,
}