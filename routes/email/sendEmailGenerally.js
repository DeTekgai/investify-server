const express = require("express");
const router = express.Router();
const {
  sendEmailsToAllUsers,
  sendUserAnEmail,
} = require("../../controllers/email/sendGeneralEmail");

router.post("/send-emails", sendEmailsToAllUsers);
router.post("/send-email", sendUserAnEmail);
module.exports = router;
