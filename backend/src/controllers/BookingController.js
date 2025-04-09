const Booking = require("../models/bookingModel");

class BookingController {
  async getAllBookings(req, res) {
    try {
      const bookings = await Booking.getAll();
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving bookings!" });
    }
  }

  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await Booking.getById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found!" });
      }
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving booking details!" });
    }
  }

  async getBookingsByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      
      console.log("getBookingsByCustomer - User info:", {
        role: req.user.role,
        userId: req.user.id,
        customerId: req.user.customerId,
        CustomerID: req.user.CustomerID,
        requestedCustomerId: customerId
      });
      
      // Kiểm tra quyền truy cập (chỉ customer được xem bookings của chính họ)
      if (req.user.role === 'Customer') {
        // Kiểm tra cả customerId và CustomerID để đảm bảo không bỏ sót
        const userCustomerId = req.user.customerId || req.user.CustomerID;
        if (userCustomerId != customerId) {
          return res.status(403).json({ 
            message: "Bạn không có quyền xem đặt phòng của người khác!",
            userCustomerId,
            requestedCustomerId: customerId
          });
        }
      }
      
      const bookings = await Booking.getBookingsByCustomer(customerId);
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error in getBookingsByCustomer:", error);
      res.status(500).json({ 
        message: "Lỗi khi lấy danh sách đặt phòng!", 
        error: error.message 
      });
    }
  }

  async createBooking(req, res) {
    try {
      console.log("Received booking data:", req.body);
      
      const {
        CustomerID,
        RoomID,
        CheckInDate,
        CheckOutDate,
        TotalPrice,
        Status = "Pending",
        NumberOfGuests,
        EstimatedArrivalTime = null,
        BookingCode,
      } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!CustomerID) {
        console.log("Missing CustomerID");
        return res.status(400).json({ message: "Thiếu ID khách hàng" });
      }
      
      if (!RoomID) {
        console.log("Missing RoomID");
        return res.status(400).json({ message: "Thiếu ID phòng" });
      }
      
      if (!CheckInDate) {
        console.log("Missing CheckInDate");
        return res.status(400).json({ message: "Thiếu ngày nhận phòng" });
      }
      
      if (!CheckOutDate) {
        console.log("Missing CheckOutDate");
        return res.status(400).json({ message: "Thiếu ngày trả phòng" });
      }
      
      if (!NumberOfGuests) {
        console.log("Missing NumberOfGuests");
        return res.status(400).json({ message: "Thiếu số lượng khách" });
      }

      // Log chi tiết thông tin để debug
      console.log("CustomerID:", CustomerID, "Type:", typeof CustomerID);
      console.log("RoomID:", RoomID, "Type:", typeof RoomID);
      console.log("CheckInDate:", CheckInDate);
      console.log("CheckOutDate:", CheckOutDate);
      console.log("TotalPrice:", TotalPrice, "Type:", typeof TotalPrice);
      console.log("NumberOfGuests:", NumberOfGuests, "Type:", typeof NumberOfGuests);

      // Kiểm tra ngày đặt phòng
      const checkInDate = new Date(CheckInDate);
      const checkOutDate = new Date(CheckOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log("Parsed dates - CheckIn:", checkInDate, "CheckOut:", checkOutDate, "Today:", today);

      if (isNaN(checkInDate.getTime())) {
        console.log("Invalid CheckInDate format");
        return res.status(400).json({ message: "Định dạng ngày nhận phòng không hợp lệ" });
      }

      if (isNaN(checkOutDate.getTime())) {
        console.log("Invalid CheckOutDate format");
        return res.status(400).json({ message: "Định dạng ngày trả phòng không hợp lệ" });
      }

      if (checkInDate < today) {
        console.log("CheckInDate is in the past");
        return res.status(400).json({ 
          message: "Ngày nhận phòng không thể là ngày trong quá khứ" 
        });
      }

      if (checkOutDate <= checkInDate) {
        console.log("CheckOutDate must be after CheckInDate");
        return res.status(400).json({ 
          message: "Ngày trả phòng phải sau ngày nhận phòng" 
        });
      }

      // Kiểm tra phòng có khả dụng trong khoảng thời gian này không
      try {
        console.log("Checking room availability...");
        const isRoomAvailable = await Booking.checkRoomAvailability(
          RoomID, 
          CheckInDate, 
          CheckOutDate
        );
        console.log("Room availability:", isRoomAvailable);

        if (!isRoomAvailable) {
          return res.status(400).json({ 
            message: "Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn ngày khác." 
          });
        }
      } catch (error) {
        console.error("Error checking room availability:", error);
        return res.status(500).json({ 
          message: "Lỗi kiểm tra tình trạng phòng. Vui lòng thử lại sau.",
          error: error.message 
        });
      }

      // Convert price to float
      let price;
      try {
        price = parseFloat(TotalPrice);
        if (isNaN(price) || price <= 0) {
          console.log("Invalid TotalPrice:", TotalPrice);
          return res.status(400).json({ message: "Giá phòng không hợp lệ!" });
        }
      } catch (error) {
        console.error("Error parsing TotalPrice:", error);
        return res.status(400).json({ message: "Giá phòng không hợp lệ!" });
      }

      // Tạo mã đặt phòng nếu không có
      const bookingCode = BookingCode || generateBookingCode();
      console.log("BookingCode:", bookingCode);

      try {
        const newBookingId = await Booking.create({
          CustomerID: parseInt(CustomerID),
          RoomID: parseInt(RoomID),
          CheckInDate,
          CheckOutDate,
          TotalPrice: price,
          Status,
          NumberOfGuests: parseInt(NumberOfGuests),
          EstimatedArrivalTime,
          BookingCode: bookingCode,
        });

        console.log("Booking created successfully. ID:", newBookingId);
        res.status(201).json({
          message: "Đặt phòng thành công!",
          BookingID: newBookingId,
          BookingCode: bookingCode
        });
      } catch (dbError) {
        console.error("Database error creating booking:", dbError);
        res.status(500).json({ 
          message: "Lỗi khi lưu thông tin đặt phòng!", 
          error: dbError.message 
        });
      }
    } catch (error) {
      console.error("Error in createBooking:", error);
      res
        .status(500)
        .json({ message: "Lỗi khi đặt phòng!", error: error.message });
    }
  }

  async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log("Update booking request:", { id, updateData });

      // Kiểm tra dữ liệu đầu vào
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "Không có dữ liệu cập nhật!" });
      }

      // Nếu là customer hủy đặt phòng, chỉ cho phép cập nhật trạng thái
      if (req.user.role === 'Customer') {
        // Lấy thông tin booking hiện tại để kiểm tra
        const booking = await Booking.getById(id);
        
        if (!booking) {
          return res.status(404).json({ message: "Không tìm thấy thông tin đặt phòng!" });
        }
        
        console.log("updateBooking - Booking and User info:", {
          bookingCustomerId: booking.CustomerID,
          userCustomerId: req.user.customerId,
          userCustomerID: req.user.CustomerID,
          currentStatus: booking.Status
        });
        
        // Kiểm tra customer chỉ được hủy booking của chính họ
        const userCustomerId = req.user.customerId || req.user.CustomerID;
        if (booking.CustomerID != userCustomerId) {
          return res.status(403).json({ message: "Bạn không có quyền hủy đặt phòng của người khác!" });
        }
        
        // Chỉ cho phép hủy nếu trạng thái hiện tại là Pending
        if (booking.Status !== 'Pending') {
          return res.status(400).json({ 
            message: "Chỉ có thể hủy đặt phòng khi trạng thái là 'Chờ xác nhận'!" 
          });
        }
        
        // Chỉ cho phép cập nhật trạng thái thành Cancelled
        if (updateData.Status !== 'Cancelled') {
          return res.status(400).json({ 
            message: "Bạn chỉ có thể hủy đặt phòng, không thể thay đổi trạng thái khác!" 
          });
        }
      }

      if (updateData.EstimatedArrivalTime === "") {
        updateData.EstimatedArrivalTime = null;
      }

      console.log("Updating booking with data:", updateData);
      const updated = await Booking.update(id, updateData);
      
      if (!updated) {
        console.error("Failed to update booking");
        return res.status(400).json({ message: "Không thể cập nhật thông tin đặt phòng!" });
      }

      // Lấy thông tin booking đã cập nhật để kiểm tra
      const updatedBooking = await Booking.getById(id);
      console.log("Updated booking status:", updatedBooking.Status);

      // Trả về thông tin thành công
      res.status(200).json({ 
        message: updateData.Status === 'Cancelled' 
          ? "Đã hủy đặt phòng thành công!" 
          : "Cập nhật thông tin đặt phòng thành công!",
        booking: updatedBooking
      });
    } catch (error) {
      console.error("Update error:", error);
      res
        .status(500)
        .json({ message: "Lỗi khi cập nhật thông tin đặt phòng!", error: error.message });
    }
  }

  async deleteBooking(req, res) {
    try {
      const { id } = req.params;

      const existingBooking = await Booking.getById(id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found!" });
      }

      await Booking.remove(id);
      res.status(200).json({ message: "Booking deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting booking!" });
    }
  }

  async getBookedDates(req, res) {
    try {
      const { roomId } = req.params;
      
      console.log("Request to get booked dates for room:", roomId);
      
      if (!roomId) {
        return res.status(400).json({ message: "Thiếu ID phòng" });
      }
      
      const bookedDates = await Booking.getBookedDatesByRoom(roomId);
      
      res.status(200).json({ 
        bookedDates: bookedDates 
      });
    } catch (error) {
      console.error("Error in getBookedDates:", error);
      res.status(500).json({ 
        message: "Lỗi khi lấy danh sách ngày đã đặt!", 
        error: error.message 
      });
    }
  }
}

// Hàm tạo mã đặt phòng ngẫu nhiên
const generateBookingCode = () => {
  const prefix = "BK";
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

module.exports = new BookingController();
