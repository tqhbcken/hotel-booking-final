const express = require("express");
const router = express.Router();
const {register, login, getProfile, logout, refreshToken} = require("../controllers/authController");
const {authenticateToken} = require("../middlewares/auth");

//register new user default role is customer
router.post("/register", register);

//login
router.post("/login", login);

//get profile, after login
router.get("/profile", authenticateToken, getProfile);

//logout
router.post("/logout", authenticateToken, logout);

//refresh token
router.post("/refresh", refreshToken);

module.exports = router;
