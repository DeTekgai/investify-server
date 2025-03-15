const express = require("express");
const {
  createWithdrawalMethod,
  getWithdrawals,
  updateWithdrawStatus,
  getWithdrawalMethods,
  userWithdrawFunction,
  editWithdrawalMethods,
  deleteWithdrawalMethod,
  getRecentWithdrawals,
  userWithdrawalLog,
} = require("../../controllers/withdraw/withdrawMethodController");
const router = express.Router();

/**
 * @swagger
 * /api/withdrawMethod:
 *   post:
 *     summary: Create a withdrawal method
 *     description: Allows the admin to create a new withdrawal method.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the withdrawal method.
 *                 example: Bank Transfer
 *     responses:
 *       201:
 *         description: Withdrawal method created successfully.
 *       400:
 *         description: Bad request.
 */
router.post("/withdrawMethod", createWithdrawalMethod);

/**
 * @swagger
 * /api/withdraw:
 *   post:
 *     summary: Withdraw funds
 *     description: Allows users to withdraw funds from their account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw.
 *                 example: 500
 *               method:
 *                 type: string
 *                 description: Withdrawal method.
 *                 example: Bank Transfer
 *     responses:
 *       200:
 *         description: Withdrawal request submitted successfully.
 *       400:
 *         description: Bad request.
 */
router.post("/withdraw", userWithdrawFunction);

/**
 * @swagger
 * /api/withdrawMethods:
 *   get:
 *     summary: Get withdrawal methods
 *     description: Retrieve a list of available withdrawal methods.
 *     responses:
 *       200:
 *         description: A list of withdrawal methods.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the withdrawal method.
 *                   name:
 *                     type: string
 *                     description: Name of the withdrawal method.
 */
router.get("/withdrawMethods", getWithdrawalMethods);

/**
 * @swagger
 * /api/admin/withdrawals:
 *   get:
 *     summary: Get all withdrawal requests
 *     description: Allows the admin to view all withdrawal requests.
 *     responses:
 *       200:
 *         description: A list of all withdrawal requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the withdrawal request.
 *                   amount:
 *                     type: number
 *                     description: Amount requested for withdrawal.
 *                   status:
 *                     type: string
 *                     description: Status of the withdrawal request.
 */
router.get("/admin/withdrawals", getWithdrawals);
router.get("/withdrawLogs/:userId", userWithdrawalLog);
router.get("/recent/withdrawals", getRecentWithdrawals);
/**
 * @swagger
 * /api/admin/withdrawMethods/{id}:
 *   put:
 *     summary: Edit a withdrawal method
 *     description: Allows the admin to update details of a withdrawal method.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the withdrawal method to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the withdrawal method.
 *                 example: PayPal
 *     responses:
 *       200:
 *         description: Withdrawal method updated successfully.
 *       400:
 *         description: Bad request.
 */
router.put("/admin/withdrawMethods/:id", editWithdrawalMethods);

/**
 * @swagger
 * /api/admin/withdraw/{id}:
 *   patch:
 *     summary: Update withdrawal status
 *     description: Allows the admin to update the status of a withdrawal request.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the withdrawal request to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Updated status of the withdrawal request.
 *                 example: Approved
 *     responses:
 *       200:
 *         description: Withdrawal status updated successfully.
 *       400:
 *         description: Bad request.
 */
router.patch("/admin/withdraw/:id", updateWithdrawStatus);

/**
 * @swagger
 * /api/admin/withdrawMethod/{id}:
 *   Delete:
 *     summary: Delete withdrawal method
 *     description: Allows the admin to delete a withdrawal method.

 */
router.delete("/admin/withdrawMethod/:id", deleteWithdrawalMethod);

module.exports = router;
