const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJwt = (token, email) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`verifying jwt for ${email} - ${token}`, payload);
    if (payload.email === email) {
      return true;
    }
  } catch (err) {
    console.log('error verifying jwt', err.message || err);
  }
  return false;
}

module.exports = verifyJwt;