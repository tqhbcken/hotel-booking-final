const pool = require("../config/db");

const getAll = async () => {
  const query = "SELECT * FROM roomtypes";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (id) => {
  const query = "SELECT * FROM roomtypes WHERE RoomTypeID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const create = async (roomTypeName) => {
  const query = "INSERT INTO roomtypes (RoomTypeName) VALUES (?)";
  const [result] = await pool.execute(query, [roomTypeName]);
  return result.insertId;
};

const update = async (RoomTypeID, roomTypeName) => {
  const query = "UPDATE roomtypes SET RoomTypeName = ? WHERE RoomTypeID = ?";
  const [result] = await pool.execute(query, [roomTypeName, RoomTypeID]);
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const query = "DELETE FROM roomtypes WHERE RoomTypeID = ?";
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
