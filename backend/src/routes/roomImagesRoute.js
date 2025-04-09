const express = require("express");
const router = express.Router();
const RoomImageController = require("../controllers/RoomImagesController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");

// CRUD Routes
router.get("/", RoomImageController.getAllImages);
router.get("/:id", RoomImageController.getImageById);
router.get("/room/:roomId", RoomImageController.getImagesByRoomId);
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), RoomImageController.createImage);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), RoomImageController.updateImage);
router.delete("/:id", authenticateToken, getRole(["Admin"]), RoomImageController.deleteImage);

module.exports = router;
