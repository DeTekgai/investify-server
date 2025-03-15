const mongoose = require("mongoose");

const investmentPlanSchema = new mongoose.Schema(
  {
    plan_name: {
      type: String,
      required: true,
    },
    min_amount: {
      type: Number,
      required: true,
    },
    max_amount: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    roi: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const InvestmentPlan = mongoose.model("InvestmentPlan", investmentPlanSchema);
module.exports = InvestmentPlan;
