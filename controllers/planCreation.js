const InvestmentPlan = require("../models/investmentPlanModel");

exports.createPlan = async (req, res) => {
  try {
    const { plan_name, min_amount, max_amount, duration, roi } = req.body;

    // Validate input
    if (!plan_name || !min_amount || !max_amount || !duration || !roi) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (min_amount > max_amount) {
      return res
        .status(400)
        .json({ message: "Minimum amount must be less than maximum amount" });
    }

    if (roi <= 0) {
      return res.status(400).json({ message: "ROI must be greater than 0" });
    }

    if (duration < 0) {
      return res
        .status(400)
        .json({ message: "Duration must be greater than 0 hours" });
    }

    const existingPlan = await InvestmentPlan.findOne({ plan_name });
    if (existingPlan) {
      return res
        .status(400)
        .json({ message: "Plan with this name already exists" });
    }

    const newPlan = new InvestmentPlan({
      plan_name,
      min_amount,
      max_amount,
      duration,
      roi,
    });

    await newPlan.save();

    res
      .status(201)
      .json({ message: "Investment plan created successfully", data: newPlan });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find({}).sort({ _id: -1 });

    res.status(200).json({ message: "Successfully fetched", data: plans });
  } catch (err) {
    console.error("Error fetching plan:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.editPlan = async (req, res) => {
  try {
    const itemToEdit = await InvestmentPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!itemToEdit) {
      res.status(404).json({ message: "No item found" });
    }
    res
      .status(200)
      .json({ message: "Investment plan updated", data: itemToEdit });
  } catch (error) {
    console.error("Error editing plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const itemToDelete = await InvestmentPlan.findByIdAndDelete(req.params.id);
    if (!itemToDelete) {
      res.status(404).json({ message: "No item found" });
    }
    res.status(200).json({ message: `${itemToDelete.plan_name} deleted` });
  } catch (error) {
    console.error("Error deleting plan", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
