const User = require("../models/User.model");
const {
  hashPassword,
  comparePassword,
  generateFormattedPassword,
} = require("../utils/password");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");

exports.register = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được đăng ký." });
    }
    // Mã hóa mật khẩu trước khi lưu vào database
    const hashedPassword = await hashPassword(password);
    // Tạo người dùng mới
    const newUser = new User({
      userName,
      email,
      password: hashedPassword, // Nên mã hóa password trong thực tế (dùng bcrypt)
      provider: "local",
    });
    await newUser.save();
    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// // Đăng nhập người dùng
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản chưa được đăng kí" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Tạo JWT token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login bằng google

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Tạo mật khẩu mới ngẫu nhiên
    const newPassword = generateFormattedPassword(8);
    const hashedPassword = await hashPassword(newPassword);

    // Cập nhật mật khẩu trong database
    user.password = hashedPassword;
    await user.save();

    // Gửi email chứa mật khẩu mới
    const emailContent = `
      <h3>Chào bạn!</h3>
      <p>Mật khẩu mới của bạn là: <strong>${newPassword}</strong></p>
      <p>Hãy đăng nhập và đổi lại mật khẩu ngay sau đó.</p>
    `;

    await sendEmail(user.email, "Mật khẩu mới của bạn", emailContent);

    res.json({ message: "Mật khẩu mới đã được gửi tới email của bạn" });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau" });
  }
};

// Đổi mật khẩu (Cần access tokentoken)
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { userId } = req.user; // Được lấy từ middleware xác thực
  console.log(userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
