const nodemailer = require("nodemailer");
require("dotenv").config();

// =============================
// Configure Transporter
// =============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error);
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

// =============================
// Function to Send OTP
// =============================
const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 SuperMarket Account OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>SuperMarket Password Reset</h2>
          <p>Dear user,</p>
          <p>Your One-Time Password (OTP) for resetting your password is:</p>
          <h3 style="color: #007bff; font-size: 24px;">${otp}</h3>
          <p>This OTP is valid for <b>1 minutes</b>. Please do not share it with anyone.</p>
          <p>Thanks,<br><b>SuperMarket Support Team</b></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP Email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
};

module.exports = { sendOtpEmail };
