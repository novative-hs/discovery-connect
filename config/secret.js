const dotenv = require("dotenv");
const path = require("path");

// Force load .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

module.exports.secret = {
  email_service: process.env.SERVICE || "gmail",
  email_user: process.env.EMAIL_USER || "",
  email_pass: process.env.EMAIL_PASS || "",
  email_host: process.env.HOST || "smtp.gmail.com",
  email_port: process.env.EMAIL_PORT || 465,
};