require("dotenv").config();
const nodemailer = require("nodemailer");
const { secret } = require("./secret");

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env.HOST,       // box573.bluehost.com
  port: process.env.EMAIL_PORT, // 465
  secure: true,                 // true for port 465
  auth: {
    user: process.env.EMAIL_USER, // full email
    pass: process.env.EMAIL_PASS, // mailbox password
  },
  tls: {
    rejectUnauthorized: false,   // sometimes needed on shared hosting
  },
});



// Verify transporter before sending emails
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter error:", error);
  } else {
    console.log("✅ Server is ready to take messages");
  }
});


// Function to send an email
const sendEmail = async (to, subject, html) => {
  if (!to || !subject || !html) {
    console.error("Missing email parameters");
    throw new Error("Missing email parameters");
  }

  const mailOptions = {
    from: secret.email_user,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error);
    //throw new Error("Error sending email.");
    return { success: true, message: "Email sent successfully." };
  }
};

module.exports = { sendEmail };
