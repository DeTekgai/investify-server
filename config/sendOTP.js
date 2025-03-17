const transporter = require("../services/emailService");
{
  /* <img style="display:block;max-height:28px;width:auto" src="https://ci3.googleusercontent.com/meips/ADKq_NYnR8RrmEzTcdA_g5Wr5k3yGyWcQa7B0pdz4QGMHupkoSK_3L7ylD-Qlb9op06QnpLKPjIES1rtsBX98vWs-rHnTXwY=s0-d-e1-ft#https://s.udemycdn.com/email/logo-udemy-v3.png" alt="Udemy" width="75" class="CToWUd" data-bit="iit"> */
}

const sendOTPEmail = (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
    <div style="color:#1c1d1f;margin:0;font-family:'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';font-size:16px;font-weight:400;line-height:1.4">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f9fa;padding:24px">
            <tbody><tr>
                <td>&nbsp;</td>
                <td width="600">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff">
                        
                            <tbody>
                            <tr>
                                <td style="border-bottom:1px solid #cccccc;padding:24px">
                                    <h2>Cryphorizon</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px 24px 0 24px">
                                        <p>
                                          <a style="text-decoration:none;color:#1c1d1f">
                                                    Hi ${name},
                                          </a>
                                        </p>
                                        <p>
                                          <a style="text-decoration:none;color:#1c1d1f"></a>
                                        </p>
                                            <p>
                                              <a style="text-decoration:none;color:#1c1d1f">Use the code below to complete registration.</a>
                                            </p>
                                            <p>
                                            </p>
                                            <p style="margin-bottom:0">
                                                <a style="text-decoration:none;color:#1c1d1f"></a>
                                            </p>
                                                <h1 style="background-color:#d3d3d352;text-align:center">
                                                <a style="text-decoration:none;color:#1c1d1f">${otp}</a></h1><a style="text-decoration:none;color:#1c1d1f"></a><p><a style="text-decoration:none;color:#1c1d1f"></a><a style="text-decoration:none;color:#1c1d1f">This code expires in 10 minutes.</a>
                                                </p><a style="text-decoration:none;color:#1c1d1f"></a><p><a style="text-decoration:none;color:#1c1d1f"></a>
                                                </p>
                                            <p></p>
                                </td>
                            </tr>
                        <tr>
                            <td style="padding:48px 24px 0 24px">
                                <p style="font-family:'SF Pro Text',-apple-system,BlinkMacSystemFont,Roboto,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';font-size:12px;font-weight:400;line-height:1.4;color:#6a6f73;margin:0">
                                        Delivered by CRYPHORIZON team.
                                   
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding:24px 0 0 0"></td>
                        </tr>
                    </tbody>
                    </table>
                </td>
                <td>&nbsp;</td>
            </tr>
        </tbody>
        </table>
  
     
    `,
  };

  //   <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border: 1px solid #ddd;">
  //   <h2 style="color: #333; text-align: center; text-transform: uppercase;">Investment site</h2>
  //   <p style="text-align: center;">To complete registration input the OTP in the area provided.</p>
  //   <p style="font-size: 16px; color: #555; text-align: center;">
  //     Your OTP code is
  //     <strong style="font-size: 18px;">${otp}</strong>
  //     <br>
  //     <span style="font-size: 16px; color: #555; text-align: center;">It will expire in <strong>10</strong> minutes.</span>
  //   </p>
  // </div>
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendOTPEmail;
