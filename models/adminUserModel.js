const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: { type: String },
    otpExpiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const AdminUser = mongoose.model("Admin", adminSchema);
module.exports = AdminUser;
