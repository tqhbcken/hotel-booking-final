const express = require("express");
const router = express.Router();
const amenityController = require("../controllers/AmenityController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


router.get("/", authenticateToken, amenityController.getAllAmenities);
router.get("/:id", authenticateToken, amenityController.getAmenityById);
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), amenityController.createAmenity);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), amenityController.updateAmenity);
router.delete("/:id", authenticateToken, getRole(["Admin"]), amenityController.deleteAmenity);

module.exports = router;
