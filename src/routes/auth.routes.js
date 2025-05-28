const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const authController = require("../controllers/auth.controller");

//Đăng ký người dùng mới
router.post("/register", authController.register);
//Xác thực tài khoản
router.patch("/active/:token", authController.active); //token là parameter nằm trong URL
//Đăng nhập token
router.post("/login", authController.login);
//Đăng nhập bằng google
router.post("/google-login", authController.googleLogin);
//Đăng nhập bằng facebook
router.post("/facebook-login", authController.facebookLogin);
//Quên mật khẩu
router.post("/forgot-password", authController.forgotPassword);
//Xử lý gửi lại email xác thực
router.post("/resend-active-link", authController.resendActiveLink);
//Đổi mật khẩu (tuỳ chọn)
router.post("/change-password", verifyToken, authController.changePassword);
module.exports = router;
