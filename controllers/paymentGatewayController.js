const cloudinary = require("cloudinary").v2;
const paymentGateway = require("../models/deposit/paymentGateway");
const userWithdraw = require("../models/withdraw/manageWithdraw");
const userPayment = require("../models/deposit/userPayment");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// Uploading a new gateway to the panel
exports.uploadPaymentGateway = async (req, res) => {
  try {
    const {
      gateway_name,
      short_gateway_name,
      charge,
      conversion_rate,
      isActive,
      wallet_address,
    } = req.body;

    const parsedCharge = parseFloat(charge);
    const parsedConversionRate = parseFloat(conversion_rate);

    // Validate required fields
    // if (
    //   !gateway_name ||
    //   !short_gateway_name ||
    //   isNaN(parsedCharge) ||
    //   isNaN(parsedConversionRate) ||
    //   parsedCharge < 0 ||
    //   parsedConversionRate < 0 ||
    //   isActive === undefined ||
    //   !wallet_address
    // ) {
    //   return res.status(400).json({
    //     message:
    //       "All fields are required and must be valid. Charge and Conversion Rate must be non-negative numbers.",
    //   });
    // }

    // Check for existing gateway
    const gateways = await paymentGateway.findOne({ gateway_name });
    if (gateways) {
      return res
        .status(400)
        .json({ message: "A gateway with this name already exists" });
    }

    // Upload images to Cloudinary
    const gatewayImageUpload = await cloudinary.uploader.upload(
      req.files.gateway_image[0].path,
      { folder: "payment_images" }
    );

    const qrCodeUpload = await cloudinary.uploader.upload(
      req.files.qr_code[0].path,
      { folder: "payment_images" }
    );

    // Create a new gateway
    const newGateway = new paymentGateway({
      gateway_image: gatewayImageUpload.secure_url,
      qr_code: qrCodeUpload.secure_url,
      short_gateway_name,
      wallet_address,
      isActive,
      gateway_name,
      charge: parsedCharge,
      conversion_rate: parsedConversionRate,
    });

    await newGateway.save();
    res.status(201).json({
      message: `${gateway_name} gateway uploaded successfully`,
      data: newGateway,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating a new gateway", error });
  }
};

exports.editPaymentGateway = async (req, res) => {
  try {
    const { id } = req.params;
    const { gateway_name, charge, conversion_rate, isActive, wallet_address } =
      req.body;

    const parsedCharge = parseFloat(charge);
    const parsedConversionRate = parseFloat(conversion_rate);

    if (
      !gateway_name ||
      isNaN(parsedCharge) ||
      parsedCharge < 0 ||
      isNaN(parsedConversionRate) ||
      parsedConversionRate < 0 ||
      isActive === undefined ||
      !wallet_address
    ) {
      return res.status(400).json({
        message:
          "All fields are required and must be valid. Charge and Conversion Rate must be non-negative numbers.",
      });
    }

    const updateData = {
      gateway_name,
      charge: parsedCharge,
      conversion_rate: parsedConversionRate,
      isActive,
      wallet_address,
    };

    const itemToEdit = await paymentGateway.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!itemToEdit) {
      return res.status(404).json({ message: "No item found" });
    }

    res.status(200).json({ message: "Edit successful", data: itemToEdit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error editing gateway", error });
  }
};

// Get the gateways
exports.getPaymentGateways = async (req, res) => {
  try {
    const gateways = await paymentGateway.find({});
    res.status(200).json({ message: "Fetching successfully", data: gateways });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payment gateways", error });
  }
};

// Get by ID
exports.getPaymentGatewaysById = async (req, res) => {
  try {
    const paymentId = await paymentGateway.findById(req.params.id);
    if (!paymentId) {
      res.status(404).json({ message: "Sorry, not found" });
    }

    res.status(200).json({ message: "Success", data: paymentId });
  } catch (error) {}
};

// Delete a Gateway
exports.deletePaymentGateways = async (req, res) => {
  try {
    const deletedGateway = await paymentGateway.findByIdAndDelete(
      req.params.id
    );
    res
      .status(200)
      .json({ message: "Deleted successfully", data: deletedGateway });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting paymentGateway", error });
  }
};

exports.userUploadPaymentGateway = async (req, res) => {
  try {
    const { payment_proof_image, paid_by, amount_paid } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Bad request, image must be a file",
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "payment_images",
    });

    // Check if the user exists
    const user = await User.findById(paid_by);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const paymentDetails = new userPayment({
      payment_proof_image: uploadResult.url,
      amount_paid,
      paid_by,
      date_paid: new Date(),
      status: "pending",
    });

    await paymentDetails.save();

    return res.status(201).json({
      message: "Payment details uploaded successfully and await approval.",
      data: paymentDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error uploading payment", error });
  }
};

exports.approvePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action provided." });
    }

    const payment = await userPayment.findById(paymentId).populate("paid_by");
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ message: "Payment already processed." });
    }

    if (action === "approve") {
      const user = await User.findById(payment.paid_by._id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      user.balance += payment.amount_paid;
      await user.save();

      payment.status = "approved";
    } else if (action === "reject") {
      payment.status = "rejected";
    }

    await payment.save();

    return res.status(200).json({
      message: `Payment has been ${action}d successfully.`,
      data: payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error processing payment", error });
  }
};

exports.userUploadPaymentGatewayDetails = async (req, res) => {
  try {
    const payments = await userPayment
      .find({})
      .sort({ _id: -1 })
      .populate(
        "paid_by",
        "first_name last_name username profile_img email balance isActive createdAt updatedAt referrals total_earnings transactions total_invest user_plan"
      );

    res.status(200).json({ data: payments });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching", err: error.message });
  }
};

exports.getRecentDeposits = async (req, res) => {
  try {
    const recentDeposits = await userPayment
      .find({ status: "approved" })
      .sort({ _id: -1 })
      .select("-payment_proof_image -updatedAt -createdAt")
      .limit(5)
      .populate(
        "paid_by",
        "first_name last_name username email balance transactions user_plan"
      );
    res.status(200).json({ data: recentDeposits });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching", error });
  }
};

exports.userUploadPaymentGatewayDetailsById = async (req, res) => {
  try {
    const payments = await userPayment
      .findById(req.params.id)
      .populate(
        "paid_by",
        "first_name last_name username profile_img email balance isActive createdAt updatedAt referrals total_earnings transactions total_invest user_plan"
      );

    if (!payments) {
      return res.status(404).json({ message: "Nothing found" });
    }

    return res.status(200).json({ data: payments });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Error fetching", error });
  }
};
exports.userDepositLog = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
    }

    const depositLog = await userPayment
      .find({ paid_by: new mongoose.Types.ObjectId(userId) }).sort({_id: -1})
      .populate("paid_by", "username first_name last_name").select("-payment_proof_image -updatedAt -createdAt");

    if (depositLog.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No deposits logs found for the specified user.",
      });
    }

    res.status(200).json({
      success: true,
      count: depositLog.length,
      data: depositLog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the deposits logs.",
      error: err.message,
    });
  }
};
// GET ALL staCTISTICS

exports.getStats = async (req, res) => {
  try {
    // Aggregation for deposits
    const depositStats = await userPayment.aggregate([
      {
        $group: {
          _id: null,
          totalPendingDeposits: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          totalDeposits: { $sum: 1 },
          totalAmountPaid: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, "$amount_paid", 0],
            },
          },
        },
      },
    ]);

    // Aggregation for withdrawals
    const withdrawalStats = await userWithdraw.aggregate([
      {
        $group: {
          _id: null,
          totalPendingWithdrawals: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          totalAcceptedWithdrawals: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          totalRejectedWithdrawals: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          totalAmountWithdrawn: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, "$amount", 0] },
          },
        },
      },
    ]);

    const result = {
      deposits:
        depositStats.length > 0
          ? {
              totalDeposits: depositStats[0].totalDeposits,
              totalPendingDeposits: depositStats[0].totalPendingDeposits,
              totalAmountPaid: depositStats[0].totalAmountPaid,
            }
          : {
              totalDeposits: 0,
              totalPendingDeposits: 0,
              totalAmountPaid: 0,
            },
      withdrawals:
        withdrawalStats.length > 0
          ? {
              totalWithdrawals: withdrawalStats[0].totalWithdrawals,
              totalPendingWithdrawals:
                withdrawalStats[0].totalPendingWithdrawals,
              totalAcceptedWithdrawals:
                withdrawalStats[0].totalAcceptedWithdrawals,
              totalAmountWithdrawn: withdrawalStats[0].totalAmountWithdrawn,
            }
          : {
              totalWithdrawals: 0,
              totalPendingWithdrawals: 0,
              totalAcceptedWithdrawals: 0,
              totalAmountWithdrawn: 0,
            },
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
