const pool = require("../config/db");

const getAll = async () => {
  const query = "SELECT * FROM addresses";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (id) => {
  const query = "SELECT * FROM addresses WHERE AddressID = ?";
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

const create = async ({
  AddressType,
  EntityID,
  StreetAddress,
  Ward,
  District,
  City,
  PostalCode,
}) => {
  const query = `
    INSERT INTO addresses (AddressType, EntityID, StreetAddress, Ward, District, City, PostalCode, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
  const [result] = await pool.execute(query, [
    AddressType,
    EntityID,
    StreetAddress,
    Ward,
    District,
    City,
    PostalCode,
  ]);
  return result.insertId;
};

const update = async (
  id,
  { AddressType, EntityID, StreetAddress, Ward, District, City, PostalCode }
) => {
  const query = `
    UPDATE addresses 
    SET AddressType = ?, EntityID = ?, StreetAddress = ?, Ward = ?, District = ?, City = ?, PostalCode = ? 
    WHERE AddressID = ?`;
  const [result] = await pool.execute(query, [
    AddressType,
    EntityID,
    StreetAddress,
    Ward,
    District,
    City,
    PostalCode,
    id,
  ]);
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const query = "DELETE FROM addresses WHERE AddressID = ?";
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
