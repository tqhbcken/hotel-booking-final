const pool = require("../config/db");

const getAll = async () => {
  const query = "SELECT * FROM Hotels";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (id) => {
  const query = "SELECT * FROM Hotels WHERE HotelID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

const create = async (hotelData) => {
  const { HotelName, PhoneNumber, Email, Description } = hotelData;
  const query = `
    INSERT INTO Hotels (HotelName, PhoneNumber, Email, Description, CreatedAt)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const [result] = await pool.execute(query, [
    HotelName,
    PhoneNumber,
    Email,
    Description,
  ]);
  return result.insertId;
};

const update = async (id, hotelData) => {
  const { HotelName, PhoneNumber, Email, Description } = hotelData;
  const query = `
    UPDATE Hotels 
    SET HotelName = ?, PhoneNumber = ?, Email = ?, Description = ?
    WHERE HotelID = ?
  `;
  const [result] = await pool.execute(query, [
    HotelName,
    PhoneNumber,
    Email,
    Description,
    id,
  ]);
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const query = "DELETE FROM Hotels WHERE HotelID = ?";
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
