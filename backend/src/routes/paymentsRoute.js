const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


// CRUD Routes
router.get("/", authenticateToken, getRole(["Admin", "Staff"]), PaymentController.getAllPayments);
router.get("/:id", authenticateToken, getRole(["Admin", "Staff", "Customer"]), PaymentController.getPaymentById);
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), PaymentController.createPayment);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), PaymentController.updatePayment);
router.delete("/:id", authenticateToken, getRole(["Admin"]), PaymentController.deletePayment);

module.exports = router;
