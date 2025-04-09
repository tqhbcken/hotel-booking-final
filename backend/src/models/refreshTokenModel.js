const pool = require("../config/db");
const jwtConfig = require("../utils/jwtConfig");

const createRefreshToken = async (refreshToken) => {

    const decoded = jwtConfig.verifyRefreshToken(refreshToken);
    if (!decoded) {
        throw new Error("Invalid refresh token");
    }
    const AccountID = decoded.id;
    const Token = refreshToken;
    const ExpiresAt = new Date(decoded.exp * 1000); 
    
    const query = "INSERT INTO RefreshTokens (AccountID, Token, ExpiresAt) VALUES (?, ?, ?)";
    await pool.execute(query, [AccountID, Token, ExpiresAt]);
    return true;
};


const removeRefreshToken = async (AccountID) => {
  const query = "DELETE FROM RefreshTokens WHERE AccountID = ?";
  try {
    const [result] = await pool.execute(query, [AccountID]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
};


const findTokenByValue = async (token) => {
  const query = "SELECT * FROM RefreshTokens WHERE Token = ? AND ExpiresAt > NOW()";
  const [rows] = await pool.execute(query, [token]);  
  return rows.length > 0 ? rows[0] : null;
};

const deleteExpiredTokens = async () => {
  const query = "DELETE FROM RefreshTokens WHERE ExpiresAt < NOW()";
  const [result] = await pool.execute(query);
  return result.affectedRows;
};

module.exports = {
    createRefreshToken,
    removeRefreshToken,
    findTokenByValue,
    deleteExpiredTokens
};



