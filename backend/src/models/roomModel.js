const pool = require("../config/db");

// Lấy tất cả phòng
const getAll = async (params = {}) => {
  try {
    const { checkIn, checkOut, guests, limit } = params;
    
    // Query cơ bản
    let query = `
      SELECT r.*, rt.RoomTypeName, h.HotelName
      FROM Rooms r
      JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
      JOIN Hotels h ON r.HotelID = h.HotelID
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Nếu có tham số tìm kiếm theo ngày, thêm điều kiện
    if (checkIn && checkOut) {
      query += `
        AND r.RoomID NOT IN (
          SELECT b.RoomID FROM Bookings b 
          WHERE (b.Status = 'Confirmed' OR b.Status = 'Pending')
          AND ((b.CheckInDate <= ? AND b.CheckOutDate >= ?) 
          OR (b.CheckInDate <= ? AND b.CheckOutDate >= ?) 
          OR (b.CheckInDate >= ? AND b.CheckOutDate <= ?))
        )
      `;
      queryParams.push(checkOut, checkOut, checkIn, checkIn, checkIn, checkOut);
    }
    
    // Nếu có tham số số lượng khách, thêm điều kiện
    if (guests) {
      query += " AND r.Capacity >= ? ";
      queryParams.push(parseInt(guests));
    }
    
    // Thêm limit nếu có - Sử dụng giá trị số trực tiếp thay vì placeholder
    if (limit && !isNaN(parseInt(limit))) {
      const limitValue = parseInt(limit);
      query += ` LIMIT ${limitValue}`;
      // Không thêm vào queryParams vì đã dùng giá trị trực tiếp
    }
    
    console.log("SQL Query:", query);
    console.log("Query params:", queryParams);
    
    // Thực thi query
    const [rooms] = await pool.execute(query, queryParams);
    
    // Lấy thêm thông tin ảnh và tiện ích cho mỗi phòng
    for (let room of rooms) {
      // Lấy ảnh phòng
      const [images] = await pool.execute(
        `SELECT * FROM RoomImages WHERE RoomID = ?`, 
        [room.RoomID]
      );
      room.RoomImages = images;
      
      // Lấy tiện ích phòng
      const [amenities] = await pool.execute(
        `SELECT a.* FROM Amenities a 
         JOIN RoomAmenities ra ON a.AmenityID = ra.AmenityID 
         WHERE ra.RoomID = ?`, 
        [room.RoomID]
      );
      room.Amenities = amenities;
    }
    
    return rooms;
  } catch (error) {
    console.error("Error in getAll rooms:", error);
    throw error;
  }
};

// Lấy phòng theo ID
const getById = async (id) => {
  try {
    const query = `
      SELECT r.*, rt.RoomTypeName, h.HotelName
      FROM Rooms r
      JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
      JOIN Hotels h ON r.HotelID = h.HotelID
      WHERE r.RoomID = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const room = rows[0];
    
    // Lấy ảnh phòng
    const [images] = await pool.execute(
      `SELECT * FROM RoomImages WHERE RoomID = ?`, 
      [room.RoomID]
    );
    room.RoomImages = images;
    
    // Lấy tiện ích phòng
    const [amenities] = await pool.execute(
      `SELECT a.* FROM Amenities a 
       JOIN RoomAmenities ra ON a.AmenityID = ra.AmenityID 
       WHERE ra.RoomID = ?`, 
      [room.RoomID]
    );
    room.Amenities = amenities;
    
    return room;
  } catch (error) {
    console.error("Error in getById room:", error);
    throw error;
  }
};

// Thêm phòng mới
const create = async (room) => {
  console.log("Data received for room creation:", room); // Debug xem dữ liệu đúng chưa

  const query = `
        INSERT INTO Rooms (RoomTypeID, HotelID, RoomName, PricePerNight, Description, Capacity, IsAvailable, CreatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
  try {
    const [result] = await pool.execute(query, [
      room.RoomTypeID,
      room.HotelID,
      room.RoomName,
      room.PricePerNight,
      room.Description,
      room.Capacity,
      room.IsAvailable,
    ]);
    return result.insertId;
  } catch (error) {
    console.error("Database error:", error); // Debug lỗi SQL
    throw error;
  }
};


// Cập nhật thông tin phòng
const update = async (RoomID, room) => {
  const query = `
    UPDATE Rooms
    SET RoomTypeID = ?, HotelID = ?, RoomName = ?, PricePerNight = ?, Description = ?, Capacity = ?, IsAvailable = ?
    WHERE RoomID = ?
  `;
  const [result] = await pool.execute(query, [
    room.RoomTypeID,
    room.HotelID,
    room.RoomName,
    room.PricePerNight,
    room.Description,
    room.Capacity,
    room.IsAvailable,
    RoomID,
  ]);
  return result.affectedRows > 0;
};

// Xóa phòng theo ID
const remove = async (id) => {
  const query = "DELETE FROM Rooms WHERE RoomID = ?";
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
