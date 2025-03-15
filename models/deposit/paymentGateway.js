const mongoose = require("mongoose");

const paymentGatewaySchema = new mongoose.Schema(
  {
    gateway_name: {
      type: String,
      required: true,
    },
    short_gateway_name: {
      type: String,
      required: true,
    },
    charge: {
      type: Number,
      required: true,
    },
    conversion_rate: {
      type: Number,
      required: true,
    },
    wallet_address: {
      type: String,
      required: true,
    },
    gateway_image: {
      type: String,
      required: true,
    },
    qr_code: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("paymentgateway", paymentGatewaySchema);
