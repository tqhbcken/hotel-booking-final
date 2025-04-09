const pool = require("../config/db");

// Lấy tất cả đánh giá
const getAll = async () => {
  const query = "SELECT * FROM Reviews";
  const [rows] = await pool.execute(query);
  return rows;
};

// Lấy đánh giá theo ID
const getById = async (id) => {
  const query = "SELECT * FROM Reviews WHERE ReviewID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Lấy đánh giá theo RoomID
const getByRoomId = async (roomId) => {
  const query = `
    SELECT r.*, a.Username 
    FROM Reviews r
    JOIN Accounts a ON r.AccountID = a.AccountID
    WHERE r.RoomID = ?
    ORDER BY r.CreatedAt DESC
  `;
  const [rows] = await pool.execute(query, [roomId]);
  return rows;
};

// Tạo mới một đánh giá
const create = async (reviewData) => {
  const { AccountID, RoomID, Rating, Comment } = reviewData;
  const query = `
    INSERT INTO Reviews (AccountID, RoomID, Rating, Comment)
    VALUES (?, ?, ?, ?)
  `;
  const values = [AccountID, RoomID, Rating, Comment];

  const [result] = await pool.execute(query, values);
  return result.insertId;
};

// Cập nhật đánh giá
const update = async (id, reviewData) => {
  const { Rating, Comment } = reviewData;
  const query = `
    UPDATE Reviews 
    SET Rating = ?, Comment = ?
    WHERE ReviewID = ?
  `;
  const values = [Rating, Comment, id];

  const [result] = await pool.execute(query, values);
  return result.affectedRows > 0;
};

// Xóa đánh giá theo ID
const remove = async (id) => {
  const query = "DELETE FROM Reviews WHERE ReviewID = ?";
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAll,
  getById,
  getByRoomId,
  create,
  update,
  remove,
};
