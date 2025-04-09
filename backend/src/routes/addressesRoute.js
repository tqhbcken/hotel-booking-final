const express = require('express');
const router = express.Router();
const addressesController = require("../controllers/AddressesController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");


// GET
router.get("/", authenticateToken, getRole(["Admin", "Staff"]), addressesController.getAllAddresses);

///get address by id
router.get("/:id", authenticateToken, getRole(["Admin", "Staff"]), addressesController.getAddressById);

// POST
router.post("/", authenticateToken, getRole(["Admin", "Staff"]), addressesController.createAddress);

// PUT
router.put("/:id", authenticateToken, getRole(["Admin", "Staff"]), addressesController.updateAddress);

// DELETE
router.delete("/:id", authenticateToken, getRole(["Admin"]), addressesController.deleteAddress);


module.exports = router;