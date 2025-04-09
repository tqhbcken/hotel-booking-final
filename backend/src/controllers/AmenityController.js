const Amenity = require("../models/amenityModel");

class AmenityController {
  // Get all amenities
  async getAllAmenities(req, res) {
    try {
      const amenities = await Amenity.getAll();
      res.status(200).json(amenities);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving amenities!" });
    }
  }

  // Get amenity by ID
  async getAmenityById(req, res) {
    try {
      const { id } = req.params;
      const amenity = await Amenity.getById(id);
      if (!amenity) {
        return res.status(404).json({ message: "Amenity not found!" });
      }
      res.status(200).json(amenity);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving amenity!" });
    }
  }

  // Create a new amenity
  async createAmenity(req, res) {
    try {
      const { AmenityName } = req.body;
      if (!AmenityName || AmenityName.trim() === "") {
        return res.status(400).json({ message: "Amenity name is required!" });
      }

      const newAmenityId = await Amenity.create(AmenityName);
      res
        .status(201)
        .json({
          message: "Amenity created successfully!",
          AmenityID: newAmenityId,
        });
    } catch (error) {
      console.error("Error creating amenity:", error);
      res.status(500).json({ message: "Error creating amenity!" });
    }
  }

  // Update an existing amenity
  async updateAmenity(req, res) {
    try {
      const { id } = req.params;
      const { AmenityName } = req.body;

      const existingAmenity = await Amenity.getById(id);
      if (!existingAmenity) {
        return res.status(404).json({ message: "Amenity not found!" });
      }

      await Amenity.update(id, AmenityName);
      res.status(200).json({ message: "Amenity updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error updating amenity!" });
    }
  }

  // Delete an amenity
  async deleteAmenity(req, res) {
    try {
      const { id } = req.params;

      const existingAmenity = await Amenity.getById(id);
      if (!existingAmenity) {
        return res.status(404).json({ message: "Amenity not found!" });
      }

      await Amenity.remove(id);
      res.status(200).json({ message: "Amenity deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting amenity!" });
    }
  }
}

module.exports = new AmenityController();
