const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


router.get("/", authenticateToken, getRole(["Admin", "Staff"]), BookingController.getAllBookings);
router.get("/customer/:customerId", authenticateToken, getRole(["Admin", "Staff", "Customer"]), BookingController.getBookingsByCustomer);
router.get("/:id", authenticateToken, getRole(["Admin", "Staff", "Customer"]), BookingController.getBookingById);
router.post("/", authenticateToken, getRole(["Customer", "Admin", "Staff"]), BookingController.createBooking);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff", "Customer"]), BookingController.updateBooking);
router.delete("/:id", authenticateToken, getRole(["Admin"]), BookingController.deleteBooking);

// Lấy danh sách ngày đã đặt của một phòng
router.get("/booked-dates/:roomId", BookingController.getBookedDates);

module.exports = router;
