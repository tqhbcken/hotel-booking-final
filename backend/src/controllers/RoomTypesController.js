const RoomTypes = require("../models/roomTypesModel");

class RoomTypesController {
  async getAllTypes(req, res) {
    try {
      const roomTypes = await RoomTypes.getAll();
      res.status(200).json(roomTypes);
    } catch (error) {
      res.status(500).json("Roomtypes not found!");
    }
  }

  // Lấy thông tin một RoomType theo ID
  async getRoomTypeById(req, res) {
    try {
      const { id } = req.params;
      const roomType = await RoomTypes.getById(id);

      if (!roomType) {
        return res.status(404).json({ message: "Roomtypes not found!" });
      }

      res.status(200).json(roomType);
    } catch (error) {
      res.status(500).json({ message: "Missing roomtypes information!" });
    }
  }

  // Tạo mới một RoomType
  async createRoomType(req, res) {
    try {
      const { RoomTypeName } = req.body;
      if (!RoomTypeName) {
        return res
          .status(400)
          .json({ message: "Roomtype name must not be blanked!" });
      }

      const newRoomTypeId = await RoomTypes.create(RoomTypeName);
      res.status(201).json({
        message: "Added roomtype successfully!",
        RoomTypeID: newRoomTypeId,
      });
    } catch (error) {
      res.status(500).json({ message: "Error when creating roomtype!" });
    }
  }

  // Cập nhật thông tin RoomType theo ID
  async updateRoomType(req, res) {
    try {
      const { id } = req.params;
      const { RoomTypeName } = req.body;

      if (!RoomTypeName) {
        return res
          .status(400)
          .json({ message: "Roomtype name must not be blanked!" });
      }

      const existingRoomType = await RoomTypes.getById(id);
      if (!existingRoomType) {
        return res.status(404).json({ message: "Roomtype not found!" });
      }

      const success = await RoomTypes.update(id, RoomTypeName);
      if (success) {
        res.status(200).json({ message: "Update roomtype successfully!" });
      } else {
        res
          .status(500)
          .json({
            message: "Updated failed!",
          });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error when updating roomtype!" });
    }
  }

  // Xóa RoomType theo ID
  async deleteRoomType(req, res) {
    try {
      const { id } = req.params;

      const existingRoomType = await RoomTypes.getById(id);
      if (!existingRoomType) {
        return res.status(404).json({ message: "Roomtype not found!" });
      }

      await RoomTypes.remove(id);
      res.status(200).json({ message: "Deleted roomtype successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error when deleting a roomtype!" });
    }
  }
}

module.exports = new RoomTypesController();
