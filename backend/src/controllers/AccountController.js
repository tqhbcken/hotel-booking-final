const Account = require("../models/accountModel");
const bcrypt = require("bcrypt");
const auth = require("../utils/jwtConfig");

class AccountController {
  async getAllAccounts(req, res) {
    try {
      const users = await Account.getAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //controller nhan thong tin tu request
  async createAccount(req, res) {
    const newAccount = req.body;
    try {
      //check user
      const checkUser = await Account.checkAccount(newAccount.username);
      if (checkUser.length > 0) {
        return res.status(400).json({ message: "User already exist" });
      }
      const user = await Account.create(newAccount);
      res.status(200).json("User created successfully!");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }


  async updateAccount(req, res) {
    try {
      const { id } = req.params; // Lấy accountid từ URL
      const { username, password, role } = req.body; // Lấy dữ liệu từ body

      // Kiểm tra nếu accountid không tồn tại
      if (!id) {
        return res.status(400).json({ message: "Account ID is required." });
      }

      // Kiểm tra xem có tài khoản với ID này không
      const account = await Account.getById(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found." });
      }

      // Kiểm tra nếu password tồn tại thì băm mật khẩu
      let hashedPassword = account.PASSWORDHASH; // Mặc định giữ nguyên password cũ
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Cập nhật thông tin
      const result = await Account.update(id, username, hashedPassword, role);

      if (result.affectedRows > 0) {
        return res
          .status(200)
          .json({ message: "Account updated successfully!" });
      } else {
        return res.status(400).json({ message: "No changes were made." });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  async deleteAccounts(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Account ID is required." });
      }

      const result = await Account.deleteAccount(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json({ message: "Account deleted successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AccountController();
