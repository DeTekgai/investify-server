const mongoose = require("mongoose");

const userPayment = new mongoose.Schema(
  {
    paid_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    payment_proof_image: {
      type: String,
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    date_paid: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("payments", userPayment);
