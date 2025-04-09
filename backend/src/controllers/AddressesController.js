const Address = require("../models/addressesModel");

class AddressesController {
  // Lấy tất cả địa chỉ
  async getAllAddresses(req, res) {
    try {
      const addresses = await Address.getAll();
      res.status(200).json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Error when getting addresses list!" });
    }
  }

  // Lấy địa chỉ theo ID
  async getAddressById(req, res) {
    try {
      const { id } = req.params;
      const address = await Address.getById(id);
      if (!address) {
        return res.status(404).json({ message: "Address doesn't exist" });
      }
      res.status(200).json(address);
    } catch (error) {
      res.status(500).json({ message: "Error when getting address!" });
    }
  }

  // Thêm địa chỉ mới
  async createAddress(req, res) {
    try {
      const {
        AddressType,
        EntityID,
        StreetAddress,
        Ward,
        District,
        City,
        PostalCode,
      } = req.body;
      const newAddressId = await Address.create({
        AddressType,
        EntityID,
        StreetAddress,
        Ward,
        District,
        City,
        PostalCode,
      });

      res
        .status(201)
        .json({ message: "Add address successfully!", AddressID: newAddressId });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error when create address!", error: error.message });
    }
  }

  // Cập nhật địa chỉ
  async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const {
        AddressType,
        EntityID,
        StreetAddress,
        Ward,
        District,
        City,
        PostalCode,
      } = req.body;

      const existingAddress = await Address.getById(id);
      if (!existingAddress) {
        return res.status(404).json({ message: "Address doesn't exist" });
      }

      await Address.update(id, {
        AddressType,
        EntityID,
        StreetAddress,
        Ward,
        District,
        City,
        PostalCode,
      });

      res.status(200).json({ message: "Update address successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error when update address" });
    }
  }

  // Xóa địa chỉ
  async deleteAddress(req, res) {
    try {
      const { id } = req.params;

      const existingAddress = await Address.getById(id);
      if (!existingAddress) {
        return res.status(404).json({ message: "Address doesn't exist!" });
      }

      await Address.remove(id);
      res.status(200).json({ message: "Delete address successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error when deleting address!" });
    }
  }
}

module.exports = new AddressesController();
