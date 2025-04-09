const Room = require("../models/roomModel");

class RoomController {
  // Lấy danh sách tất cả phòng
  async getAllRooms(req, res) {
    try {
      // Lấy các tham số tìm kiếm từ request
      const { checkIn, checkOut, guests, limit } = req.query;
      
      // Truyền các tham số vào model
      const rooms = await Room.getAll({
        checkIn,
        checkOut,
        guests: guests ? parseInt(guests) : null,
        limit: limit ? parseInt(limit) : null
      });
      
      res.status(200).json(rooms);
    } catch (error) {
      console.error("Error in getAllRooms:", error);
      res.status(500).json({ 
        message: "Error when getting room's list!",
        error: error.message
      });
    }
  }

  // Lấy thông tin phòng theo ID
  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      const room = await Room.getById(id);
      if (!room) {
        return res.status(404).json({ message: "Room doesn't exist!" });
      }
      res.status(200).json(room);
    } catch (error) {
      console.error("Error in getRoomById:", error);
      res.status(500).json({ 
        message: "Error when getting room's information!",
        error: error.message
      });
    }
  }

  // Thêm phòng mới
  async createRoom(req, res) {
    try {
      
      const {
        RoomTypeID,
        HotelID,
        RoomName,
        PricePerNight,
        Description,
        Capacity,
        IsAvailable,
      } = req.body;

      // Chuyển đổi về số nguyên hoặc số thực
      const price = parseFloat(PricePerNight);
      if (isNaN(price) || price <= 0 || price > 99999999.99) {
        return res.status(400).json({ message: "Invalid price!" });
      }

      const newRoomId = await Room.create({
        RoomTypeID: parseInt(RoomTypeID),
        HotelID: parseInt(HotelID),
        RoomName,
        PricePerNight: price,
        Description,
        Capacity: parseInt(Capacity),
        IsAvailable: parseInt(IsAvailable),
      });

      res
        .status(201)
        .json({ message: "Added room successfully!", RoomID: newRoomId });
    } catch (error) {
      console.error("Added room error:", error);
      res
        .status(500)
        .json({ message: "Added room error occurred!", error: error.message });
    }
  }

  // Cập nhật phòng
  async updateRoom(req, res) {
    try {
      const {
        id,
        RoomTypeID,
        HotelID,
        RoomName,
        PricePerNight,
        Description,
        Capacity,
        IsAvailable,
      } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Missing ID for update!" });
      }

      const existingRoom = await Room.getById(id);
      if (!existingRoom) {
        return res.status(404).json({ message: "Room doesn't exist!" });
      }

      // Chuyển đổi kiểu dữ liệu cho đúng
      const price = parseFloat(PricePerNight);
      if (isNaN(price) || price <= 0 || price > 99999999.99) {
        return res.status(400).json({ message: "Invalid price!" });
      }

      await Room.update(id, {
        RoomTypeID: parseInt(RoomTypeID),
        HotelID: parseInt(HotelID),
        RoomName,
        PricePerNight: price,
        Description,
        Capacity: parseInt(Capacity),
        IsAvailable: parseInt(IsAvailable),
      });

      res.status(200).json({ message: "Updated room successfully!" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error when updating room!", error: error.message });
    }
  }

  // Xóa phòng
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      const existingRoom = await Room.getById(id);
      if (!existingRoom) {
        return res.status(404).json({ message: "Room doesn't exist!" });
      }

      await Room.remove(id);
      res.status(200).json({ message: "Delete room successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error when deleting a room!" });
    }
  }
}

module.exports = new RoomController();
