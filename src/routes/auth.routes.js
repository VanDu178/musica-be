const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const authController = require("../controllers/auth.controller");

//Đăng ký người dùng mới
router.post("/register", authController.register);

// // Đăng nhập người dùng
router.post("/login", authController.login);

// Quên mật khẩu
router.post("/forgot-password", authController.forgotPassword);

//Đổi mật khẩu (tuỳ chọn)
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;
