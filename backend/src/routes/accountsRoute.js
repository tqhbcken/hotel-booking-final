const express = require("express");
const router = express.Router();
const accountController = require("../controllers/AccountController");
const {authenticateToken} = require("../middlewares/auth");
const {getRole} = require("../middlewares/role");

//get all accs
router.get("/", authenticateToken, getRole(["Admin"]), accountController.getAllAccounts);

//create new acc
router.post("/", authenticateToken, getRole(["Admin"]), accountController.createAccount);

//update acc
router.put("/:id", authenticateToken, getRole(["Admin"]), accountController.updateAccount);

//delete acc by id
router.delete("/:id", authenticateToken, getRole(["Admin"]), accountController.deleteAccounts);


module.exports = router;
