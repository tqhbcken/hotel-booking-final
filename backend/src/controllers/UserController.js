const User = require("../models/usersModel");

class UserController {
  // Lấy tất cả người dùng
  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving users!" });
    }
  }

  // Lấy người dùng theo ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user!" });
    }
  }

  // Tạo mới người dùng
  async createUser(req, res) {
    try {
      const { AccountID, FullName, Email, PhoneNumber } = req.body;

      if (!AccountID || !FullName || !Email) {
        return res
          .status(400)
          .json({ message: "AccountID, FullName, and Email are required!" });
      }

      const newUserId = await User.create({
        AccountID,
        FullName,
        Email,
        PhoneNumber,
      });

      res.status(201).json({
        message: "User created successfully!",
        UserID: newUserId,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user!" });
    }
  }

  // Cập nhật thông tin người dùng
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { FullName, Email, PhoneNumber } = req.body;

      const existingUser = await User.getById(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      await User.update(id, { FullName, Email, PhoneNumber });
      res.status(200).json({ message: "User updated successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error updating user!" });
    }
  }

  // Xóa người dùng
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const existingUser = await User.getById(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      await User.remove(id);
      res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user!" });
    }
  }
}

module.exports = new UserController();
