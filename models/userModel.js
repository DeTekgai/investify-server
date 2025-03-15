const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    profile_img: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    total_withdraw: {
      type: Number,
      required: true,
      default: 0,
    },
    total_deposit: {
      type: Number,
      required: true,
      default: 0,
    },
    pending_withdraw: {
      type: Number,
      required: true,
      default: 0,
    },
    pending_deposit: {
      type: Number,
      required: true,
      default: 0,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    user_plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestmentPlan",
      default: null,
    },
    referrals: {
      type: Number,
      default: 0,
    },
    total_earnings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    total_invest: {
      type: Number,
      required: true,
      default: 0, 
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
