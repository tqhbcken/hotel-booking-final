const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


///generate jwt
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

///generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
};


///verify jwt
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
}

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};


module.exports = {
  generateAccessToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
};
