const Hotels = require("../models/hotelsModel");

class HotelsController {
  async getAllHotels(req, res) {
    try {
      const hotels = await Hotels.getAll();
      res.status(200).json(hotels);
    } catch (error) {
      res.status(500).json("Can't get hotels's data");
    }
  }

  // get hotel by id
  async getHotelById(req, res) {
    try {
      const { id } = req.params;
      const hotel = await Hotels.getById(id);

      if (!hotel) {
        return res.status(404).json({ message: "Hotels are not exist" });
      }

      res.status(200).json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Error when get hotels data" });
    }
  }

  // Tạo khách sạn mới
  async createHotel(req, res) {
    try {
      const { HotelName, PhoneNumber, Email, Description } = req.body;
      if (!HotelName || !PhoneNumber || !Email || !Description) {
        return res
          .status(400)
          .json({ message: "Please add more information!" });
      }

      const newHotelId = await Hotels.create(req.body);
      res.status(201).json({
        message: "Hotel added successfully!",
        HotelID: newHotelId,
      });
    } catch (error) {
      res.status(500).json({ message: "Error when create a hotel" });
    }
  }

  // Cập nhật thông tin khách sạn theo ID
  async updateHotel(req, res) {
    try {
      const { id } = req.params;
      const { HotelName, PhoneNumber, Email, Description } = req.body;

      if (!HotelName || !PhoneNumber || !Email || !Description) {
        return res
          .status(400)
          .json({ message: "Please fill in all information!" });
      }

      const existingHotel = await Hotels.getById(id);
      if (!existingHotel) {
        return res.status(404).json({ message: "This hotel does not exist" });
      }

      await Hotels.update(id, req.body);
      res.status(200).json({ message: "Updated hotel's data successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error when updating hotel's data" });
    }
  }

  // Xóa khách sạn theo ID
  async deleteHotel(req, res) {
    try {
      const { id } = req.params;

      const existingHotel = await Hotels.getById(id);
      if (!existingHotel) {
        return res.status(404).json({ message: "This hotel doesn't exist!" });
      }

      await Hotels.remove(id);
      res.status(200).json({ message: "Deleted hotel successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error when deleting a hotel!" });
    }
  }
}

module.exports = new HotelsController();
