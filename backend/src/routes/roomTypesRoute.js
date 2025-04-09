const express = require('express');
const router = express.Router();
const roomTypesController = require("../controllers/RoomTypesController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");

// GET
router.get("/", authenticateToken, getRole(["Admin", "Staff"]), roomTypesController.getAllTypes);

// GET by id
router.get("/:id", authenticateToken, getRole(["Admin", "Staff"]), roomTypesController.getRoomTypeById);

// POST
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), roomTypesController.createRoomType)

// PUT
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), roomTypesController.updateRoomType)

// DELETE
router.delete("/:id", authenticateToken, getRole(["Admin"]), roomTypesController.deleteRoomType)


module.exports = router;