const express = require('express');
const router = express.Router();
const roomController = require("../controllers/RoomController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");

// GET
router.get("/", roomController.getAllRooms);

// GET by id
router.get("/:id", roomController.getRoomById);

// POST
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), roomController.createRoom)

// PUT
router.put("/", authenticateToken, getRole(["Admin", "Staff"]), roomController.updateRoom)

// DELETE
router.delete("/:id", authenticateToken, getRole(["Admin"]), roomController.deleteRoom)

module.exports = router;