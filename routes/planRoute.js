const express = require("express");
const {
  createPlan,
  getPlans,
  editPlan,
  deletePlan,
} = require("../controllers/planCreation");
const { purchasePlan } = require("../controllers/purchasePlan");

const upload = require("../config/cloudinary");
const router = express.Router();

router.post("/plan", createPlan);
router.get("/plans", getPlans);
router.post("/plan/purchase", purchasePlan);
router.put("/plan/:id", editPlan);
router.delete("/plan/:id", deletePlan);

module.exports = router;
