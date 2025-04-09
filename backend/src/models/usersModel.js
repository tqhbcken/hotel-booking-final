const pool = require("../config/db");

// Lấy tất cả người dùng
const getAll = async () => {
  const query = "SELECT * FROM Users";
  const [rows] = await pool.execute(query);
  return rows;
};

// Lấy người dùng theo ID
const getById = async (id) => {
  const query = "SELECT * FROM Users WHERE UserID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Tạo mới một người dùng
const create = async (userData) => {
  const { AccountID, FullName, Email, PhoneNumber } = userData;
  const query = `
    INSERT INTO Users (AccountID, FullName, Email, PhoneNumber)
    VALUES (?, ?, ?, ?)
  `;
  const values = [AccountID, FullName, Email, PhoneNumber];

  const [result] = await pool.execute(query, values);
  return result.insertId;
};

// Cập nhật thông tin người dùng
const update = async (id, userData) => {
  const { FullName, Email, PhoneNumber } = userData;
  const query = `
    UPDATE Users 
    SET FullName = ?, Email = ?, PhoneNumber = ?
    WHERE UserID = ?
  `;
  const values = [FullName, Email, PhoneNumber, id];

  const [result] = await pool.execute(query, values);
  return result.affectedRows > 0;
};

// Xóa người dùng theo ID
const remove = async (id) => {
  const query = "DELETE FROM Users WHERE UserID = ?";
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
