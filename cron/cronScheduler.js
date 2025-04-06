const ActiveInvestment = require("../models/activeInvestmentPlan");
const User = require("../models/userModel");

exports.setupDailyCronJob = async (userId, plan, amount, investmentId) => {
  try {
    let executionCount = 0;

    const intervalId = setInterval(async () => {
      const activeInvestment = await ActiveInvestment.findById(investmentId).populate("user");

      if (!activeInvestment || activeInvestment.isCompleted) {
        console.log(`Investment ${investmentId} is already completed or does not exist.`);
        clearInterval(intervalId);
        return;
      }

      const user = activeInvestment.user;
      const dailyROI = activeInvestment.daily_roi;

      user.total_earnings += dailyROI;
      user.balance += dailyROI;
      await user.save();

      console.log(`${user.username}: Total earnings: ${user.total_earnings}`);

      executionCount++;

      if (executionCount >= plan.duration) {
        user.balance += activeInvestment.amount;
        user.user_plan = null;
        activeInvestment.isCompleted = true;

        await user.save();
        await ActiveInvestment.findByIdAndDelete(investmentId);

        console.log(`Investment ${investmentId} completed for ${user.username}`);
        clearInterval(intervalId);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  } catch (error) {
    console.error("Error setting up investment interval:", error);
  }
};
