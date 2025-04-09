const express = require('express');
const router = express.Router();
const hotelsController = require("../controllers/HotelsController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


// GET
router.get("/", authenticateToken, getRole(["Admin", "Staff"]), hotelsController.getAllHotels);
router.get("/:id", authenticateToken, getRole(["Admin", "Staff"]), hotelsController.getHotelById);

// POST
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), hotelsController.createHotel)

// PUT
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), hotelsController.updateHotel)

// DELETE
router.delete("/:id", authenticateToken, getRole(["Admin"]), hotelsController.deleteHotel)


module.exports = router;