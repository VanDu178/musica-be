// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");
// const dotenv = require("dotenv");

// dotenv.config();

// // Đăng ký người dùng mới
// exports.register = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Kiểm tra email đã tồn tại chưa
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     // Mã hóa mật khẩu
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Tạo người dùng mới
//     const newUser = new User({
//       email,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     res
//       .status(201)
//       .json({ message: "User created successfully", userId: newUser._id });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Đăng nhập người dùng
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Kiểm tra người dùng có tồn tại không
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Kiểm tra mật khẩu
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Tạo JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Đổi mật khẩu
// exports.changePassword = async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   const { userId } = req.user; // Được lấy từ middleware xác thực

//   try {
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedNewPassword;
//     await user.save();

//     res.json({ message: "Password updated successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Xác thực token (middleware)
// exports.verifyToken = async (req, res) => {
//   try {
//     const token = req.headers["authorization"]?.split(" ")[1]; // Lấy token từ header
//     if (!token) {
//       return res.status(403).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.json({ message: "Token is valid", userId: decoded.userId });
//   } catch (err) {
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
