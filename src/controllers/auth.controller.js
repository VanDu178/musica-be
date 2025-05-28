const User = require("../models/User.model");
const Role = require("../models/Role.model");
const Verification = require("../models/Verification.model");
const {
  hashPassword,
  comparePassword,
  generateFormattedPassword,
  sendEmailActiveAccount,
} = require("../utils/auth");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  //req là object http request, nó có các thuộc tính như query string, parameters, body, header ...
  const { username, email, password } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Email đã được đăng ký.",
        error_code: "EMAIL_ALREADY_EXISTS",
      });
    }
    // Mã hóa mật khẩu trước khi lưu vào database
    const hashedPassword = await hashPassword(password);
    //Set role mặc định cho tài khoản khi tạo
    const defaultRole = await Role.findOne({ name: "user" });
    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      provider: "local",
      role: defaultRole?._id,
    });
    await newUser.save({ session });
    await sendEmailActiveAccount(newUser.email, newUser._id, newUser.username);
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ.", error_code: "UNKNOWN_ERROR" });
  }
};
// // Đăng nhập người dùng
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Kiểm tra người dùng có tồn tại không
    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(400).json({ message: "Tài khoản chưa được đăng kí" });
    }

    //Kiểm tra xem tài khoản đã được kích hoạt chưa
    if (!user.isActive) {
      return res.status(400).json({
        message: "Tài khoản chưa được kích hoạt",
        error_code: "ACCOUNT_NOT_ACTIVATED",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Mật khẩu không đúng",
        error_code: "INVALID_CREDENTIALS",
      });
    }

    // Tạo JWT token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Lưu refresh token dưới dạng HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true, // Chỉ gửi qua HTTPS trong môi trường production
      sameSite: "Strict", // Ngăn chặn CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

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

    res
      .status(200)
      .json({ message: "Mật khẩu mới đã được gửi tới email của bạn" });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại sau" });
  }
};

// Đổi mật khẩu (Cần access tokentoken)
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { userId } = req.user; // Được lấy từ middleware xác thực
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không trùng khớp" });
    }
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    res.status(200).json({
      message: "Mật khẩu được cập nhật thành công",
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Dang nhap bang google
exports.googleLogin = async (req, res) => {
  res.json({
    message: "login by google success",
  });
};
// Dang nhap bang facebook
exports.facebookLogin = async (req, res) => {
  res.json({ message: "Login by facebook success" });
};

//Xac thuc email khi dang ki tai khoan, kích hoạt tài khoản
exports.active = async (req, res) => {
  const token = req.params.token;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Giải mã thô để lấy userId (không cần xác thực token)
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.userId) {
      return res.status(400).json({
        message: "Token không hợp lệ.",
        error_code: "INVALID_LINK",
      });
    }

    // 2. Kiểm tra trạng thái user
    const user = await User.findById(decoded.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Không tìm thấy người dùng.",
        error_code: "USER_NOT_FOUND",
      });
    }

    if (user.isActive) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({
        message: "Tài khoản của bạn đã được kích hoạt trước đó.",
        error_code: "ALREADY_ACTIVATED",
      });
    }

    // 3. Lúc này mới verify token thực sự (để check hạn và tính hợp lệ)
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({
          message: "Link kích hoạt đã hết hạn.",
          error_code: "LINK_EXPIRED",
        });
      } else {
        return res.status(400).json({
          message: "Token không hợp lệ.",
          error_code: "INVALID_LINK",
        });
      }
    }

    // 4. Kiểm tra record xác thực
    const record = await Verification.findOne({ code: token }).session(session);
    if (!record || record.used) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Link kích hoạt không hợp lệ hoặc đã được sử dụng.",
        error_code: "LINK_ALREADY_USED",
      });
    }

    // 5. Kích hoạt
    user.isActive = true;
    await user.save({ session });

    record.used = true;
    await record.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Kích hoạt tài khoản thành công.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({
      message: "Lỗi máy chủ.",
      error_code: "SERVER_ERROR",
    });
  }
};

exports.resendActiveLink = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
        error_code: "USER_NOT_EXITED",
      });
    }
    if (existingUser.isActive) {
      return res.status(400).json({
        message: "Tài khoản đã được kích hoạt trước đó",
        error_code: "ACCOUNT_ALREADY_ACTIVED",
      });
    }

    await sendEmailActiveAccount(
      email,
      existingUser._id,
      existingUser.username
    );
    return res.status(200).json({ message: "Email xác thực đã được gửi lại." });
  } catch (error) {
    console.log("da xay ra loi", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi nội bộ. Vui lòng thử lại sau.",
      error_code: "",
    });
  }
};
