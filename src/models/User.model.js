const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: String,
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // Dành cho đăng nhập bằng email/password (nếu có)
  googleId: { type: String }, // Dành cho đăng nhập bằng Google
  facebookId: { type: String }, // Dành cho đăng nhập bằng Facebook
  avatar: { type: String }, // Ảnh đại diện (nếu từ Google/Facebook)
  provider: {
    type: String,
    enum: ["local", "google", "facebook"],
    default: "local",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
