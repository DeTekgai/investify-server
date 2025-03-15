const transporter = require("../../services/emailService");
const User = require("../../models/userModel");
const sendGeneralEmailByAdmin = require("../../models/email/adminSendEmail");
require("dotenv").config();

exports.sendEmailsToAllUsers = async (req, res) => {
  try {
    // Retrieve the email subject and message from the request body
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ message: "Subject and message are required" });
    }
    const emailContent = new sendGeneralEmailByAdmin({ subject, message });
    await emailContent.save();

    // Fetch all user emails
    const users = await User.find({}, "email");
    const emailList = users.map((user) => user.email);

    // Helper function to chunk email addresses
    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    const chunkedEmailLists = chunkArray(emailList, 50);

    // Send emails in chunks
    for (const chunk of chunkedEmailLists) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: chunk.join(","),
        subject,
        html: message,
      };

      await transporter.sendMail(mailOptions);
    }

    console.log("All emails sent successfully");
    res.status(200).json({ message: "All emails sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};

exports.sendUserAnEmail = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      return res
        .status(400)
        .json({ message: "User ID, subject, and message are required" });
    }

    // Fetch the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create mail options for sending email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      html: `
<div style="color: #1c1d1f; margin: 0; font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, Roboto, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 16px; font-weight: 400; line-height: 1.4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f9fa; padding: 24px;">
    <tbody>
      <tr>
        <td>&nbsp;</td>
        <td width="600">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff;">
            <tbody>
              <!-- Logo Section -->
              <tr style="background: #000080;">
                <td style="border-bottom: 1px solid #cccccc; padding: 24px;">
                  <img 
                    src="https://res.cloudinary.com/dtpicchy6/image/upload/v1733577120/profile_images/lombx7evp3w6vf7kr6h9.png" 
                    alt="Logo" 
                    style="max-width: 200px; border-radius: 10px;"
                  />
                </td>
              </tr>

              <!-- Message Section -->
              <tr>
                <td style="padding: 24px 24px 0 24px;">
                  <p>
                    <a style="text-decoration: none; color: #1c1d1f;">
                      Hi ${user.username},
                    </a>
                  </p>
                  <p>
                    <a style="text-decoration: none; color: #1c1d1f;"></a>
                  </p>
                  <div style="background-color: #d3d3d352;">
                    ${message}
                  </div>
                  <p></p>
                </td>
              </tr>

              <!-- Footer Section -->
              <tr>
                <td style="padding: 38px 24px 0 24px;">
                  <p style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, Roboto, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; font-size: 12px; font-weight: 400; line-height: 1.4; color: #6a6f73; margin: 0;">
                    Delivered by TekGai.
                  </p>
                </td>
              </tr>

              <!-- Spacer -->
              <tr>
                <td style="padding: 24px 0 0 0;"></td>
              </tr>
            </tbody>
          </table>
        </td>
        <td>&nbsp;</td>
      </tr>
    </tbody>
  </table>
</div>
`,
      //  <div style="width: 100%; max-width: 100%; margin: 0 auto; padding: 20px; background-color: #eee; font-family: Arial, sans-serif;">
      //  <div style="text-align: center; margin-bottom: 20px;">
      //    <img src="https://res.cloudinary.com/dtpicchy6/image/upload/v1733577120/profile_images/lombx7evp3w6vf7kr6h9.png" alt="Logo" style="max-width: 200px; border-radius: 10px;"/>
      //  </div>
      //  <div>
      //    ${message}
      // </div>     // html: message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${user.email}`);
    // res.status(200).json({ message: `Email sent to ${user.email}` });
    res.status(200).json({ message: `Email sent successfully` });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};
