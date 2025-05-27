const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // JWT token
    code: { type: String, unique: true, required: true },
    // method: {
    //   type: String,
    //   enum: ["link", "email", "sms"],
    //   required: true,
    // },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verification", verificationSchema);
