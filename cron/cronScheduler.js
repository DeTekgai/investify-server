const cron = require("node-cron");
const ActiveInvestment = require("../models/activeInvestmentPlan");
const User = require("../models/userModel");

exports.setupDailyCronJob = async (userId, plan, amount, investmentId) => {
  try {
    let executionCount = 0;

    const task = cron.schedule("0 0 * * *", async () => {
      const activeInvestment = await ActiveInvestment.findById(
        investmentId
      ).populate("user");

      if (!activeInvestment || activeInvestment.isCompleted) {
        console.log(
          `Investment ${investmentId} is already completed or does not exist.`
        );
        task.stop();
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

        console.log(
          `Investment ${investmentId} completed for ${user.username}`
        );
        user.user_plan = null;
        await ActiveInvestment.findByIdAndDelete(investmentId);

        task.stop();
      }
    });
  } catch (error) {
    console.error("Error setting up cron job:", error);
  }
};
