const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


// CRUD Routes
router.get("/", authenticateToken, getRole(["Admin", "Staff"]), UserController.getAllUsers);
router.get("/:id", authenticateToken, getRole(["Admin", "Staff", "Customer"]), UserController.getUserById);
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), UserController.createUser);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), UserController.updateUser);
router.delete("/:id", authenticateToken, getRole(["Admin"]), UserController.deleteUser);

module.exports = router;
