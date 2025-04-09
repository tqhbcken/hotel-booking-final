const RoomImage = require("../models/roomImagesModel");

class RoomImageController {
  // Lấy tất cả ảnh phòng
  async getAllImages(req, res) {
    try {
      const images = await RoomImage.getAll();
      res.status(200).json(images);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving room images!" });
    }
  }

  // Lấy ảnh theo ID
  async getImageById(req, res) {
    try {
      const { id } = req.params;
      const image = await RoomImage.getById(id);
      if (!image) {
        return res.status(404).json({ message: "Room image not found!" });
      }
      res.status(200).json(image);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving room image!" });
    }
  }

  // Lấy danh sách ảnh theo RoomID
  async getImagesByRoomId(req, res) {
    try {
      const { roomId } = req.params;
      const images = await RoomImage.getByRoomId(roomId);
      res.status(200).json(images);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving images by RoomID!" });
    }
  }

  // Tạo ảnh mới
  async createImage(req, res) {
    try {
      const { RoomID, ImageURL, IsPrimary } = req.body;

      if (!RoomID || !ImageURL) {
        return res
          .status(400)
          .json({ message: "RoomID and ImageURL are required!" });
      }

      const newImageId = await RoomImage.create({
        RoomID,
        ImageURL,
        IsPrimary,
      });

      res.status(201).json({
        message: "Room image created successfully!",
        ImageID: newImageId,
      });
    } catch (error) {
      console.error("Error creating room image:", error);
      res.status(500).json({ message: "Error creating room image!" });
    }
  }

  // Cập nhật ảnh
  async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { RoomID, ImageURL, IsPrimary } = req.body;

      const existingImage = await RoomImage.getById(id);
      if (!existingImage) {
        return res.status(404).json({ message: "Room image not found!" });
      }

      await RoomImage.update(id, { RoomID, ImageURL, IsPrimary });
      res.status(200).json({ message: "Room image updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error updating room image!" });
    }
  }

  // Xóa ảnh
  async deleteImage(req, res) {
    try {
      const { id } = req.params;

      const existingImage = await RoomImage.getById(id);
      if (!existingImage) {
        return res.status(404).json({ message: "Room image not found!" });
      }

      await RoomImage.remove(id);
      res.status(200).json({ message: "Room image deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting room image!" });
    }
  }
}

module.exports = new RoomImageController();
