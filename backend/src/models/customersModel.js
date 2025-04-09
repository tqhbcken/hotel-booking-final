const pool = require("../config/db");

const getAll = async () => {
  const query = "SELECT * FROM Customers";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (id) => {
  const query = "SELECT * FROM Customers WHERE CustomerID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const getByAccountId = async (accountId) => {
  try {
    const query = "SELECT * FROM Customers WHERE AccountID = ?";
    const [rows] = await pool.execute(query, [accountId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error in getByAccountId:", error);
    throw error;
  }
};

const create = async (customerData) => {
  const {
    AccountID,
    FullName,
    Email,
    PhoneNumber,
    DateOfBirth,
    Nation,
    Gender,
  } = customerData;

  const query = `
    INSERT INTO Customers (AccountID, FullName, Email, PhoneNumber, DateOfBirth, Nation, Gender)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    AccountID,
    FullName,
    Email,
    PhoneNumber,
    DateOfBirth,
    Nation,
    Gender,
  ];

  const [result] = await pool.execute(query, values);
  return result.insertId;
};

const update = async (id, updateData) => {
  const fields = Object.keys(updateData)
    .map((field) => `${field} = ?`)
    .join(", ");
  const values = Object.values(updateData);

  const query = `UPDATE Customers SET ${fields} WHERE CustomerID = ?`;
  const [result] = await pool.execute(query, [...values, id]);

  return result.affectedRows > 0;
};

const remove = async (id) => {
  const query = "DELETE FROM Customers WHERE CustomerID = ?";
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByAccountId,
  create,
  update,
  remove,
};
