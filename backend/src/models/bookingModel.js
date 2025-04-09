const pool = require("../config/db");

const getAll = async () => {
  const query = "SELECT * FROM Bookings";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (id) => {
  try {
    const query = `
      SELECT b.*, 
             r.RoomName, rt.RoomTypeName, r.PricePerNight, 
             r.Capacity as MaxGuests, r.Description,
             h.HotelName, 
             (SELECT ImageURL FROM RoomImages WHERE RoomID = r.RoomID AND IsPrimary = TRUE LIMIT 1) as CoverImage
      FROM Bookings b
      LEFT JOIN Rooms r ON b.RoomID = r.RoomID
      LEFT JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
      LEFT JOIN Hotels h ON r.HotelID = h.HotelID
      WHERE b.BookingID = ?
    `;
    
    const [rows] = await pool.execute(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const booking = rows[0];
    
    // Định dạng lại dữ liệu để thống nhất với getBookingsByCustomer
    return {
      ...booking,
      Room: {
        RoomID: booking.RoomID,
        RoomName: booking.RoomName,
        RoomTypeName: booking.RoomTypeName,
        CoverImage: booking.CoverImage,
        PricePerNight: booking.PricePerNight,
        MaxGuests: booking.MaxGuests,
        Description: booking.Description,
        HotelName: booking.HotelName
      }
    };
  } catch (error) {
    console.error("Error in getById:", error);
    throw error;
  }
};

const create = async ({
  CustomerID,
  RoomID,
  CheckInDate,
  CheckOutDate,
  TotalPrice,
  Status,
  NumberOfGuests,
  EstimatedArrivalTime,
  BookingCode,
}) => {
  const query = `
    INSERT INTO Bookings (CustomerID, RoomID, CheckInDate, CheckOutDate, TotalPrice, Status, NumberOfGuests, EstimatedArrivalTime, BookingCode) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(query, [
    CustomerID,
    RoomID,
    CheckInDate,
    CheckOutDate,
    TotalPrice,
    Status,
    NumberOfGuests,
    EstimatedArrivalTime || null,
    BookingCode,
  ]);
  return result.insertId;
};

const update = async (id, updateData) => {
  try {
    console.log("Updating booking with data:", { id, updateData });
    
    // Kiểm tra nếu booking tồn tại
    const existingBooking = await getById(id);
    if (!existingBooking) {
      console.error("Booking not found:", id);
      return false;
    }
    
    // Validate status update
    if (updateData.Status) {
      const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
      if (!validStatuses.includes(updateData.Status)) {
        console.error("Invalid status:", updateData.Status);
        throw new Error("Trạng thái không hợp lệ!");
      }
    }
    
    // Tạo câu SQL động dựa trên dữ liệu cập nhật
    const fields = Object.keys(updateData)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(updateData);
    values.push(id); // Thêm ID vào cuối mảng values cho điều kiện WHERE
    
    const query = `
      UPDATE Bookings 
      SET ${fields} 
      WHERE BookingID = ?
    `;
    
    console.log("Update query:", query);
    console.log("Update values:", values);
    
    const [result] = await pool.execute(query, values);
    
    if (result.affectedRows === 0) {
      console.error("No rows affected by update");
      return false;
    }
    
    console.log("Update successful, affected rows:", result.affectedRows);
    return true;
  } catch (error) {
    console.error("Error in update:", error);
    throw error;
  }
};

const remove = async (id) => {
  const query = "DELETE FROM Bookings WHERE BookingID = ?";
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};

// Kiểm tra phòng có sẵn trong khoảng thời gian
const checkRoomAvailability = async (roomId, checkInDate, checkOutDate) => {
  try {
    console.log("checkRoomAvailability - Checking room:", roomId);
    console.log("For dates:", { checkInDate, checkOutDate });
    
    // Đảm bảo roomId là số
    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      console.error("Invalid roomId:", roomId);
      throw new Error("ID phòng không hợp lệ");
    }
    
    // Đảm bảo định dạng ngày
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      console.error("Invalid date format:", { checkInDate, checkOutDate });
      throw new Error("Định dạng ngày không hợp lệ");
    }
    
    // Format lại ngày để truy vấn SQL
    const formattedCheckIn = checkIn.toISOString().split('T')[0];
    const formattedCheckOut = checkOut.toISOString().split('T')[0];
    
    console.log("Formatted dates for SQL query:", { formattedCheckIn, formattedCheckOut });
    
    const query = `
      SELECT COUNT(*) as bookingCount
      FROM Bookings
      WHERE RoomID = ?
      AND (Status = 'Confirmed' OR Status = 'Pending')
      AND (
        (CheckInDate <= ? AND CheckOutDate >= ?) 
        OR (CheckInDate <= ? AND CheckOutDate >= ?) 
        OR (CheckInDate >= ? AND CheckOutDate <= ?)
      )
    `;
    
    console.log("SQL Query for availability check:", query);
    console.log("Query params:", [
      roomIdInt, 
      formattedCheckOut, formattedCheckOut, 
      formattedCheckIn, formattedCheckIn, 
      formattedCheckIn, formattedCheckOut
    ]);
    
    const [rows] = await pool.execute(query, [
      roomIdInt, 
      formattedCheckOut, formattedCheckOut, 
      formattedCheckIn, formattedCheckIn, 
      formattedCheckIn, formattedCheckOut
    ]);
    
    console.log("Query result:", rows);
    
    // Nếu không có booking nào tồn tại trong khoảng thời gian này, phòng khả dụng
    const isAvailable = rows[0].bookingCount === 0;
    console.log("Room is available:", isAvailable);
    return isAvailable;
  } catch (error) {
    console.error("Error checking room availability:", error);
    throw error;
  }
};

// Lấy danh sách đặt phòng của một khách hàng
const getBookingsByCustomer = async (customerId) => {
  try {
    // Câu query JOIN với bảng Rooms và RoomTypes để lấy thông tin phòng
    const query = `
      SELECT b.*, 
             r.RoomName, rt.RoomTypeName, r.PricePerNight, 
             r.Capacity as MaxGuests, r.Description,
             h.HotelName, 
             (SELECT ImageURL FROM RoomImages WHERE RoomID = r.RoomID AND IsPrimary = TRUE LIMIT 1) as CoverImage
      FROM Bookings b
      LEFT JOIN Rooms r ON b.RoomID = r.RoomID
      LEFT JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
      LEFT JOIN Hotels h ON r.HotelID = h.HotelID
      WHERE b.CustomerID = ?
      ORDER BY b.CreatedAt DESC
    `;
    
    console.log("SQL Query:", query);
    console.log("CustomerId param:", customerId);
    
    const [bookings] = await pool.execute(query, [customerId]);
    
    // Xử lý kết quả để tạo cấu trúc dễ dùng hơn cho frontend
    return bookings.map(booking => ({
      ...booking,
      Room: {
        RoomID: booking.RoomID,
        RoomName: booking.RoomName,
        RoomTypeName: booking.RoomTypeName,
        CoverImage: booking.CoverImage,
        PricePerNight: booking.PricePerNight,
        MaxGuests: booking.MaxGuests,
        Description: booking.Description,
        HotelName: booking.HotelName
      }
    }));
  } catch (error) {
    console.error("Error in getBookingsByCustomer:", error);
    throw error;
  }
};

// Lấy danh sách ngày đã đặt của một phòng
const getBookedDatesByRoom = async (roomId) => {
  try {
    console.log("Getting booked dates for room:", roomId);
    
    // Đảm bảo roomId là số
    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      console.error("Invalid roomId:", roomId);
      throw new Error("ID phòng không hợp lệ");
    }
    
    const query = `
      SELECT CheckInDate, CheckOutDate
      FROM Bookings
      WHERE RoomID = ?
      AND (Status = 'Confirmed' OR Status = 'Pending')
      ORDER BY CheckInDate
    `;
    
    const [rows] = await pool.execute(query, [roomIdInt]);
    console.log("Booked dates for room:", rows);
    
    // Chuyển đổi kết quả thành mảng các ngày không khả dụng
    const bookedDates = [];
    rows.forEach(booking => {
      const checkIn = new Date(booking.CheckInDate);
      const checkOut = new Date(booking.CheckOutDate);
      
      // Thêm tất cả các ngày từ checkIn đến checkOut vào mảng
      let currentDate = new Date(checkIn);
      while (currentDate <= checkOut) {
        bookedDates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return [...new Set(bookedDates)]; // Xóa các ngày trùng lặp
  } catch (error) {
    console.error("Error getting booked dates for room:", error);
    throw error;
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  checkRoomAvailability,
  getBookingsByCustomer,
  getBookedDatesByRoom
};
