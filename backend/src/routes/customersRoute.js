const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


router.get("/", authenticateToken, getRole(["Admin", "Staff"]), CustomerController.getAllCustomers);
router.get("/:id", authenticateToken, getRole(["Admin", "Staff", "Customer"]), CustomerController.getCustomerById);
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), CustomerController.createCustomer);
router.put("/:id", authenticateToken, getRole(["Admin", "Staff", "Customer"]), CustomerController.updateCustomer);
router.delete("/:id", authenticateToken, getRole(["Admin"]), CustomerController.deleteCustomer);

module.exports = router;
