const withdrawMethod = require("../../models/withdraw/withdrawMethod");
const userWithdraw = require("../../models/withdraw/manageWithdraw");
const mongoose = require("mongoose");
const User = require("../../models/userModel");
exports.createWithdrawalMethod = async (req, res) => {
  try {
    const {
      withdrawal_name,
      min_withdraw_amount,
      max_withdraw_amount,
      withdraw_instruction,
      withdraw_charge,
    } = req.body;
    if (
      !withdrawal_name ||
      !min_withdraw_amount ||
      !max_withdraw_amount ||
      !withdraw_instruction ||
      !withdraw_charge
    ) {
      res.status(400).json({ message: "Fill in all fields" });
    }
    const withdraw = await withdrawMethod.find({});
    if (withdraw.withdrawal_name) {
      res.status(400).json({ message: "Name already exists" });
    }

    const newWithdrawalMethod = new withdrawMethod({
      withdrawal_name,
      min_withdraw_amount,
      max_withdraw_amount,
      withdraw_instruction,
      withdraw_charge,
    });

    await newWithdrawalMethod.save();
    res.status(200).json({ message: "Posted successfully" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.editWithdrawalMethods = async (req, res) => {
  try {
    const editedItem = await withdrawMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, newValidator: true }
    );
    if (!req.params.id) {
      res.status(400).json({ message: "No item found..." });
    }
    res
      .status(200)
      .json({ message: "Item edited successfully", data: editedItem });
  } catch (error) {
    console.error("Error", error);
    res
      .status(500)
      .json({ message: "Internal server error", errMessage: error.message });
  }
};
exports.deleteWithdrawalMethod = async (req, res) => {
  try {
    const deletedWithdrawal = await withdrawMethod.findByIdAndDelete(
      req.params.id
    );
    if (!deletedWithdrawal) {
      res.status(400).json({ message: "Invalid ID" });
    }
    res.status(200).json({ message: "Deleted successfully..." });
  } catch (err) {
    console.error("Error", err);
    res
      .status(500)
      .json({ message: "Internal server error", errMessage: err.message });
  }
};
exports.getWithdrawalMethods = async (req, res) => {
  try {
    const withdrawals = await withdrawMethod.find({});

    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ message: "Internal server error", errMessage: error.message });
  }
};

// Withdraw functionalities

exports.userWithdrawFunction = async (req, res) => {
  try {
    const { amount, id, withdrawalMethodId, wallet_address } = req.body;

    // Validate input
    if (!amount || !id || !withdrawalMethodId || !wallet_address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(id);
    const withdrawMethodData = await withdrawMethod.findById(
      withdrawalMethodId
    );

    if (!user || !withdrawMethodData) {
      return res
        .status(404)
        .json({ message: "User or Withdrawal Method not found" });
    }

    // Check user's balance
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Check withdrawal limits
    if (
      amount < withdrawMethodData.min_withdraw_amount ||
      amount > withdrawMethodData.max_withdraw_amount
    ) {
      return res.status(400).json({
        message: `Withdrawal amount must be between ${withdrawMethodData.min_withdraw_amount} and ${withdrawMethodData.max_withdraw_amount}`,
      });
    }

    const newWithdrawRequest = new userWithdraw({
      withdrawal_name: withdrawalMethodId,
      wallet_address,
      amount,
      user: id,
    });

    await newWithdrawRequest.save();

    return res.status(201).json({
      message: "Withdrawal request created successfully",
      withdrawRequest: newWithdrawRequest,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error", errMessage: error.message });
  }
};

exports.updateWithdrawStatus = async (req, res) => {
  try {
    const { withdrawId, status } = req.body;

    // Validate input
    if (!withdrawId || !status) {
      return res
        .status(400)
        .json({ message: "Withdrawal ID and status are required" });
    }

    // Find withdrawal request
    const withdrawalRequest = await userWithdraw
      .findById(withdrawId)
      .populate("user", "first_name last_name username email balance")
      .populate(
        "withdrawal_name",
        "withdrawal_name min_withdraw_amount max_withdraw_amount withdraw_charge"
      );

    if (!withdrawalRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (status === "accepted") {
      const user = await User.findById(withdrawalRequest.user._id);

      if (user.balance < withdrawalRequest.amount) {
        return res
          .status(400)
          .json({ message: "Insufficient funds in user account" });
      }

      user.balance -= withdrawalRequest.amount;
      await user.save();
    }

    withdrawalRequest.status = status;
    await withdrawalRequest.save();

    return res.status(200).json({
      message: "Withdrawal status updated successfully",
      withdrawalRequest,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res
      .status(500)
      .json({ message: "Internal server error", errMessage: error.message });
  }
};

exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await userWithdraw
      .find()
      .populate(
        "user",
        "first_name last_name username profile_img email balance isActive"
      )
      .populate("withdrawal_name")
      .sort({ _id: -1 });

    res.status(200).json(withdrawals);
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ message: "Internal server error", errMessage: error.message });
  }
};
exports.getRecentWithdrawals = async (req, res) => {
  try {
    const latestWithdrawals = await userWithdraw
      .find({ status: "accepted" })
      .sort({ _id: -1 })
      .limit(5)
      .populate("withdrawal_name", "withdrawal_name")
      .populate("user", "first_name last_name email username createdAt");
    res.status(200).json({ message: "Fetched", latestWithdrawals });
  } catch (error) {
    console.error("Error: ", error);
    res
      .status(500)
      .json({ message: "Internal server error", errMessage: error.message });
  }
};

exports.userWithdrawalLog = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    const withdrawLog = await userWithdraw
      .find({ user: new mongoose.Types.ObjectId(userId) }).sort("_id: -1")
      .populate("withdrawal_name", "withdrawal_name").populate("user", "username");

    if (withdrawLog.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No withdrawal logs found for the specified user.",
      });
    }

    res.status(200).json({
      success: true,
      count: withdrawLog.length,
      data: withdrawLog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the withdrawal logs.",
      error: err.message,
    });
  }
};
