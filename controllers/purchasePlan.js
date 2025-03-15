const User = require("../models/userModel");
const InvestmentPlan = require("../models/investmentPlanModel");
const ActiveInvestment = require("../models/activeInvestmentPlan");
const { setupDailyCronJob } = require("../cron/cronScheduler");

exports.purchasePlan = async (req, res) => {
  try {
    const { userId, planId, amount } = req.body;

    // Validate input
    if (!userId || !planId || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user and investment plan
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Investment plan not found" });
    }

    // Validate amount
    if (amount < plan.min_amount || amount > plan.max_amount) {
      return res.status(400).json({
        message: `Amount must be between ${plan.min_amount} and ${plan.max_amount}`,
      });
    }

    // Check user balance
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    user.balance -= amount;
    user.total_invest += amount;

    user.user_plan = planId;

    const hourlyROI = (amount * plan.roi) / 100;

    const activeInvestment = new ActiveInvestment({
      user: userId,
      plan: planId,
      amount,
      daily_roi: hourlyROI,
    });

    // Save updates
    await activeInvestment.save();
    await user.save();

    res.status(200).json({
      message: "Plan purchased and ROI calculated successfully",
      data: {
        userId: user._id,
        planId: plan._id,
        remainingBalance: user.balance,
        hourlyROI,
        investmentId: activeInvestment._id,
      },
    });

    setupDailyCronJob(userId, plan, amount, activeInvestment._id);
  } catch (error) {
    console.error("Error purchasing plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
