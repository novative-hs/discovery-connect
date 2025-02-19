require("dotenv").config();
const nodemailer = require("nodemailer");
const { secret } = require("./secret");

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  host: secret.email_host, 
  service: secret.email_service, 
  port: secret.email_port || 465, 
  secure: secret.email_port == 465, 
  auth: {
    user: secret.email_user,
    pass: secret.email_pass, 
  },
});

// Verify transporter before sending emails
transporter.verify((err, success) => {
  if (err) {
    console.error(" Email transporter verification failed:", err.message);
  } else {
    console.log(" Email transporter is ready.");
  }
});

// Function to send an email
const sendEmail = async (to, subject, text) => {
  if (!to || !subject || !text) {
    console.error("Missing email parameters");
    throw new Error("Missing email parameters");
  }

  const mailOptions = {
    from: secret.email_user,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email.");
  }
};

module.exports = { sendEmail };