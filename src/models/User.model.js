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
  isActive: { type: Boolean, default: false },
  isBan: { type: Boolean, default: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
});

// Cấu hình để ẩn mật khẩu khi trả về thông tin user cho FE
//{Có nhiều cách nhưng chỉ cần nhớ khi trả thông tin user cho FE thì không trả thông tin nhạy cảm}
userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
});
//Cấu hình để khi xóa một user thì sẽ xóa tất cả các verication tương ứng liên quan đến user
// Middleware khi dùng findOneAndDelete
//Đây là một middleware sẽ được gọi trước mỗi khi mình dùng findOneAndDelete cho User
userSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await Verification.deleteMany({ userId: doc._id });
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
