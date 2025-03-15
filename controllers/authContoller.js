const User = require("../models/userModel");
const AdminUser = require("../models/adminUserModel");
const TempUser = require("../models/temporaryUser");
const sendOTPEmail = require("../config/sendOTP");
const generateOTP = require("../config/generateOTP");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const session = require("express-session");
const userWithdraw = require("../models/withdraw/manageWithdraw");
const mongoose = require("mongoose");
const userPayment = require("../models/deposit/userPayment");
exports.registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, isActive, username, password } =
      req.body;

    // Ensure image file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Bad request, image must be a file",
      });
    }

    let existingUser = await TempUser.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      await TempUser.deleteOne({ $or: [{ email }, { username }] });
    }

    const isUserExistInUsers = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (isUserExistInUsers) {
      return res
        .status(400)
        .json({ message: "Email or username already exists in the system" });
    }

    // Proceed with temporary registration
    req.session.tempEmail = email;
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_images",
    });

    const otp = generateOTP();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const tempUser = await TempUser.create({
      first_name,
      last_name,
      username,
      email,
      profile_img: uploadResult.secure_url,
      password: hashedPassword,
      otp,
      otpExpiresAt,
      balance: 0,
      referrals: 0,
      isActive: true,
    });

    // Send OTP email
    sendOTPEmail(email, otp, first_name);

    res.status(200).json({
      message: "OTP sent to email. Complete registration with OTP.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during registration", error });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    const email = req.session.tempEmail;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Session expired. Please register again." });
    }

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // OTP check
    if (tempUser.otp !== otp || tempUser.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const { first_name, last_name, username, password, profile_img } = tempUser;

    await User.create({
      first_name,
      last_name,
      username,
      email,
      password,
      profile_img,
      balance: 0,
      referrals: 0,
    });

    await TempUser.deleteOne({ email });
    req.session.tempEmail = null;

    res
      .status(200)
      .json({ message: "Registration complete! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password by comparing it.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(401).json({ message: "Access denied." });
    }
    // Store user details in the session
    req.session.user = {
      id: user._id,
      username: user.username,
      balance: user.balance,
      email: user.email,
      total_invest: user.total_invest,
    };

    req.session.user_id = user._id;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to save session" });
      }

      console.log("Session saved with user ID:", req.session.user_id);
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          balance: user.balance,
          total_invest: user.total_invest,
        },
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during login", error });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate("user_plan").sort({ _id: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
exports.getNewestUsers = async (req, res) => {
  try {
    const newestUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);

    res.status(200).json(newestUsers);
  } catch (error) {
    console.error("Error fetching newest users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Get by id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Fetch the user and populate the user_plan field
    const user = await User.findById(id)
      .select("-password")
      .populate("user_plan");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate total pending withdrawals
    const pendingWithdraws = await userWithdraw.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(id),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$amount" },
        },
      },
    ]);
    const totalPendingWithdraw =
      pendingWithdraws.length > 0 ? pendingWithdraws[0].totalPending : 0;

    // Calculate total withdrawals
    const totalWithdraws = await userWithdraw.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(id),
          status: "accepted",
        },
      },
      {
        $group: {
          _id: null,
          totalWithdraw: { $sum: "$amount" },
        },
      },
    ]);
    const totalWithdraw =
      totalWithdraws.length > 0 ? totalWithdraws[0].totalWithdraw : 0;

    // Calculate total deposits
    const totalDeposits = await userPayment.aggregate([
      {
        $match: {
          paid_by: new mongoose.Types.ObjectId(id),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          totalDeposit: { $sum: "$amount_paid" },
        },
      },
    ]);
    const totalDeposit =
      totalDeposits.length > 0 ? totalDeposits[0].totalDeposit : 0;

    const pendingDeposits = await userPayment.aggregate([
      {
        $match: {
          paid_by: new mongoose.Types.ObjectId(id),
          status: "pending",
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$amount_paid" },
        },
      },
    ]);
    const totalPendingDeposit =
      pendingDeposits.length > 0 ? pendingDeposits[0].totalPending : 0;

    const userWithFinancials = {
      ...user.toObject(),
      pending_withdraw: totalPendingWithdraw,
      total_withdraw: totalWithdraw,
      total_deposit: totalDeposit,
      pending_deposit: totalPendingDeposit,
    };

    res.status(200).json(userWithFinancials);
  } catch (error) {
    console.error("Error fetching user:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    res.status(500).json({ message: "Something went wrong", error });
  }
};

exports.deleteManyUsers = async (req, res) => {
  try {
    // Extract IDs from the request body
    const { ids } = req.body;

    // Validate that IDs array is provided
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide an array of user IDs to delete" });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    // Respond with the result
    res.status(200).json({
      message: `${result.deletedCount} user(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
exports.deleteSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: result,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const itemToEdit = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!itemToEdit) {
      res.status(404).json({ message: "No user found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", data: itemToEdit });
  } catch (error) {
    console.error("Error editing user", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------- ADMIN SECTION ---------------------------- //
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin
    const newAdmin = await AdminUser.create({
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "Admin registered successfully", admin: newAdmin });
  } catch (err) {
    console.error("Error registering admin:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
exports.editAdminPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const admin = await AdminUser.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "No user found" });
    }

    // Compare old password with stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
        success: false,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful!", user: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during login", error });
  }
};
