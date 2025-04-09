const pool = require("../config/db");

// Lấy tất cả ảnh phòng
const getAll = async () => {
  const query = "SELECT * FROM RoomImages";
  const [rows] = await pool.execute(query);
  return rows;
};

// Lấy ảnh theo ID
const getById = async (id) => {
  const query = "SELECT * FROM RoomImages WHERE ImageID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Lấy danh sách ảnh theo RoomID
const getByRoomId = async (roomId) => {
  const query = "SELECT * FROM RoomImages WHERE RoomID = ?";
  const [rows] = await pool.execute(query, [roomId]);
  return rows;
};

// Thêm ảnh mới
const create = async (imageData) => {
  const { RoomID, ImageURL, IsPrimary } = imageData;
  const query = `
    INSERT INTO RoomImages (RoomID, ImageURL, IsPrimary)
    VALUES (?, ?, ?)
  `;
  const values = [RoomID, ImageURL, IsPrimary || false];

  const [result] = await pool.execute(query, values);
  return result.insertId;
};

// Cập nhật ảnh theo ID
const update = async (id, imageData) => {
  const { RoomID, ImageURL, IsPrimary } = imageData;
  const query = `
    UPDATE RoomImages 
    SET RoomID = ?, ImageURL = ?, IsPrimary = ?
    WHERE ImageID = ?
  `;
  const values = [RoomID, ImageURL, IsPrimary, id];

  const [result] = await pool.execute(query, values);
  return result.affectedRows > 0;
};

// Xóa ảnh theo ID
const remove = async (id) => {
  const query = "DELETE FROM RoomImages WHERE ImageID = ?";
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
