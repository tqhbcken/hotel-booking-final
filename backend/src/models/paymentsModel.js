const pool = require("../config/db");

// Lấy tất cả thanh toán
const getAll = async () => {
  const query = "SELECT * FROM Payments";
  const [rows] = await pool.execute(query);
  return rows;
};

// Lấy thanh toán theo ID
const getById = async (id) => {
  const query = "SELECT * FROM Payments WHERE PaymentID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Tạo mới một thanh toán
const create = async (paymentData) => {
  const { BookingID, PaymentMethod, PaymentStatus, Amount } = paymentData;
  const query = `
    INSERT INTO Payments (BookingID, PaymentMethod, PaymentStatus, Amount)
    VALUES (?, ?, ?, ?)
  `;
  const values = [BookingID, PaymentMethod, PaymentStatus || "Pending", Amount];

  const [result] = await pool.execute(query, values);
  return result.insertId;
};

// Cập nhật thông tin thanh toán
const update = async (id, paymentData) => {
  const { BookingID, PaymentMethod, PaymentStatus, Amount } = paymentData;
  const query = `
    UPDATE Payments 
    SET BookingID = ?, PaymentMethod = ?, PaymentStatus = ?, Amount = ?
    WHERE PaymentID = ?
  `;
  const values = [BookingID, PaymentMethod, PaymentStatus, Amount, id];

  const [result] = await pool.execute(query, values);
  return result.affectedRows > 0;
};

// Xóa thanh toán theo ID
const remove = async (id) => {
  const query = "DELETE FROM Payments WHERE PaymentID = ?";
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
