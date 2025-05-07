const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
// // Đăng ký người dùng mới
// router.post("/register", authController.register);

// // Đăng nhập người dùng
// router.post("/login", authController.login);

// // Đổi mật khẩu (tuỳ chọn)
// router.post("/change-password", authController.changePassword);

// // Xác thực token (middleware, ví dụ dùng cho các route bảo vệ)
// router.get("/verify-token", authController.verifyToken);

module.exports = router;
