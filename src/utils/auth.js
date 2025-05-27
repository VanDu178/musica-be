//Những hàm dùng chung liên quan đến mật khẩu
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Verification = require("../models/Verification.model");
const path = require("path");
const pug = require("pug");
const sendEmail = require("../utils/sendMail");
const mongoose = require("mongoose");

// Mã hóa mật khẩu
const hashPassword = async (plainPassword) => {
  const saltRounds = 10; //saltRounds là số lần tạo muối (salt) và băm mật khẩu. Càng cao thì bảo mật càng mạnh nhưng thời gian xử lý cũng lâu hơn.
  const hashed = await bcrypt.hash(plainPassword, saltRounds); //bcrypt.hash() tạo ra mật khẩu đã được mã hóa từ mật khẩu gốc (plainPassword)
  return hashed;
};

// So sánh mật khẩu khi đăng nhập
const comparePassword = async (plainPassword, hashedPassword) => {
  const match = await bcrypt.compare(plainPassword, hashedPassword); //bcrypt.compare() sẽ lấy mật khẩu người dùng nhập (plainPassword) và so sánh với mật khẩu đã được mã hóa (hashedPassword).
  return match; //true nếu trùng khớp và false nếu không trùng khớp
};

//Tạo mật khẩu ngẫu nhiên cho chức năng quên mật khẩu
function generateFormattedPassword(length = 8) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "@#$!%&*";

  if (length < 4)
    throw new Error("Mật khẩu phải có ít nhất 4 ký tự để đáp ứng định dạng");

  // Đảm bảo mỗi loại ký tự có ít nhất 1 cái
  const getRandom = (set) => set[Math.floor(Math.random() * set.length)];

  let password = [
    getRandom(lowercase),
    getRandom(uppercase),
    getRandom(numbers),
    getRandom(symbols),
  ];

  const allChars = lowercase + uppercase + numbers + symbols;

  // Thêm ngẫu nhiên các ký tự còn lại
  for (let i = 4; i < length; i++) {
    password.push(getRandom(allChars));
  }

  // Xáo trộn để không cố định thứ tự 4 ký tự đầu
  return shuffleArray(password).join("");
}

// Hàm xáo trộn mảng (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//Những hàm dùng chung liên quan đến tạo token gửi lại cho user active tài khoản
async function sendEmailActiveAccount(email, userId, userName) {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  // Lưu token vào collection Verification
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  //Xóa các verification cũ trước khi tạo verification mới cho user này.
  await Verification.deleteMany({ userId: userId });
  const verification = new Verification({
    userId: userId,
    code: token,
    expiresAt,
  });
  await verification.save();
  //Tạo link xác thực, khi người dùng click vào link sẽ hiển thị giao diện trên FE
  //sau đó giao diện FE sẽ có một nút click "click để xác thực", FE sẽ gọi xuống BE để xác thực
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
  // Render HTML từ Pug template
  const emailContent = pug.renderFile(
    path.join(__dirname, "../views/verify-email.pug"),
    {
      name: userName,
      verificationUrl,
    }
  );
  await sendEmail(email, "Xác thực tài khoản", emailContent);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateFormattedPassword,
  sendEmailActiveAccount,
};
