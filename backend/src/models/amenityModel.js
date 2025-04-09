const pool = require("../config/db");

const getAll = async () => {
  const query = "SELECT * FROM amenities";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (id) => {
  const query = "SELECT * FROM amenities WHERE AmenityID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const create = async (amenityName) => {
  const query = "INSERT INTO amenities (AmenityName) VALUES (?)";
  const [result] = await pool.execute(query, [amenityName]);
  return result.insertId;
};

const update = async (id, amenityName) => {
  const query = "UPDATE amenities SET AmenityName = ? WHERE AmenityID = ?";
  const [result] = await pool.execute(query, [amenityName, id]);
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const query = "DELETE FROM amenities WHERE AmenityID = ?";
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
