const express = require("express");
const router = express.Router();
const upload = require("../config/cloudinary");
const {
  uploadPaymentGateway,
  getPaymentGateways,
  userUploadPaymentGateway,
  userUploadPaymentGatewayDetails,
  userUploadPaymentGatewayDetailsById,
  deletePaymentGateways,
  getPaymentGatewaysById,
  editPaymentGateway,
  approvePayment,
  getStats,
  getRecentDeposits,
  userDepositLog,
} = require("../controllers/paymentGatewayController");

router.post(
  "/admin/paymentGateway",
  upload.fields([
    { name: "gateway_image", maxCount: 1 },
    { name: "qr_code", maxCount: 1 },
  ]),
  uploadPaymentGateway
);

router.post(
  "/paymentGateway",
  upload.single("payment_proof_image"),
  userUploadPaymentGateway
);
// Get payment by Id
router.get("/paymentGateway/:id", getPaymentGatewaysById);
// Get user logs
router.get("/depositLogs/:userId", userDepositLog);
router.put("/paymentGateway/:id", editPaymentGateway);
router.get("/admin/payments", userUploadPaymentGatewayDetails);
router.get("/recent/deposits", getRecentDeposits);
router.get("/paymentGateway", getPaymentGateways);
router.get("/admin/payments/stats", getStats);
router.get("/admin/payments/:id", userUploadPaymentGatewayDetailsById);
router.patch("/payment/:paymentId", approvePayment);
router.delete("/paymentGateway/:id", deletePaymentGateways);

module.exports = router;
