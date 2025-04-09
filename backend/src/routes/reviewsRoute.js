const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


// CRUD Routes
router.get("/", authenticateToken, getRole(["Admin", "Staff"]), ReviewController.getAllReviews);
router.get("/room/:roomId", ReviewController.getReviewsByRoomId);
router.get("/:id", authenticateToken, getRole(["Admin", "Staff"]), ReviewController.getReviewById);
router.post("/", authenticateToken, getRole(["Customer"]), ReviewController.createReview);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), ReviewController.updateReview);
router.delete("/:id", authenticateToken, getRole(["Admin"]), ReviewController.deleteReview);

module.exports = router;
