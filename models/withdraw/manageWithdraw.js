const mongoose = require("mongoose");

const withdrawFunctionality = new mongoose.Schema({
  withdrawal_name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "withdrawMethods",
    required: true,
  },
  amount: {
    type: Number, 
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  wallet_address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userWithdraw = mongoose.model("withdraw", withdrawFunctionality);

module.exports = userWithdraw;
