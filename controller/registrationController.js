const accountModel = require("../models/registrationModel");
const nodemailer = require("nodemailer");

// Controller for creating the committe_member table
const createuser_accountTable = (req, res) => {
  accountModel.createuser_accountTable();
  res.status(200).json({ message: "Acounts table creation process started" });
};

const getAccountDetail = (req, res) => {
  const { id } = req.params;

  accountModel.getAccountDetail(id, (err, result) => {
    if (err) {
      console.error("Error:", err);
      if (err.message === "ID is required") {
        return res.status(400).json({ status: "fail", error: err.message });
      }
      if (err.message === "Invalid id") {
        return res.status(401).json({ status: "fail", error: err.message });
      }
      return res.status(500).json({ status: "fail", error: err.message });
    }
    res.status(200).json(result);
  });
};

const sendOTP = (req, res) => {
  

  accountModel.sendOTP(req, (err, result) => {
    if (err) {
      
      return res.status(500).json({ message: "Failed to send OTP", error: err.message });
    }

    res.status(200).json({ message: "OTP sent successfully!", otp: result.otp });
  });
};
const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required!" });
  }

  accountModel.verifyOTP(email, otp, (err, isVerified, otpExpiry) => { 
    if (err) {
      console.error("❌ Error verifying OTP:", err);
      return res.status(500).json({ message: "Failed to verify OTP", error: err.message });
    }

    // Check if OTP is expired
    if (otpExpiry && Date.now() > otpExpiry) {
      return res.status(401).json({ message: "OTP has expired. Please request a new one." });
    }

    if (!isVerified) {
      return res.status(401).json({ message: "Invalid OTP. Please try again." });
    }

    res.status(200).json({ message: "✅ OTP verified successfully!" });
  });
};

const sendEmail = (req, res) => {
  

  accountModel.sendEmailForOrder(req, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err });
    }

    return res.status(200).json({ message: result || "Quote request sent successfully" });
  });
};



const createAccount = (req, res) => {

  accountModel.createAccount(req, (err, result) => {
    if (err) {
      
      if (err.message === "Email already exists") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }

    
    res.status(201).json(result);
  });
};

const loginAccount = (req, res) => {
  const { email, password } = req.body;
  accountModel.loginAccount({ email, password }, (err, result) => {
    if (err) {
      
      if (err.message === "Email and password are required") {
        return res.status(400).json({ status: "fail", error: err.message });
      }
      if (err.message === "Invalid email or password") {
        return res.status(401).json({ status: "fail", error: err.message });
      }
      if (
        err.message === "Account is not approved" ||
        err.message === "Account is not active"
      ) {
        return res.status(403).json({ status: "fail", error: err.message });
      }
      
      return res
        .status(500)
        .json({ status: "fail", error: "Internal server error" });
    }
    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: result.id,
        accountType: result.accountType,
        email: result.email,
        action: result.action || null, 
        authToken: "mockAuthToken", // Replace with JWT or real token logic
      },
    });
  });
};

const getUserEmail = (req, res) => {
  const { id } = req.params;

  accountModel.getUserEmail(id, (err, result) => {
    if (err) {
      console.error("Error:", err);
      if (err.message === "user not found") {
        return res.status(401).json({ status: "fail", error: err.message });
      }
      return res
        .status(500)
        .json({ status: "fail", error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    res.status(200).json({ status: "success", data: result });
  });
};

const getEmail = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "fail", error: "Email is required" });
  }

  accountModel.getEmail(email, (err, result) => {
    if (err) {
      console.error(" Error:", err);
      return res.status(500).json({ status: "fail", error: "Internal server error" });
    }

    if (!result || !result.exists) {
      return res.status(404).json({ status: "fail", error: "User not found" });
    }

    res.status(200).json({ status: "success", data: result.user });
  });
};


const changepassword = (req, res) => {
  const { email, password, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  const userData = { email, password: password || null, newPassword };

  accountModel.changepassword(userData, (err, result) => {
    if (err) {
      console.error("Password Change Error:", err);
      return res.status(err.status || 500).json({ message: err.message });
    }
    return res.status(200).json({ message: "Password updated successfully." });
  });
};


const updateAccount = (req, res) => {
  

  accountModel.updateAccount(req, (err, result) => {
    if (err) {
      
      console.error("Update failed:", err);
      return res.status(500).json({ error: err.message || "Update failed" });      
    }
    res.status(201).json(result);
  });
};

module.exports = {
  createuser_accountTable,
  changepassword,
  loginAccount,
  getUserEmail,
  createAccount,
  getAccountDetail,
  updateAccount,
  getEmail,
  sendOTP,
  verifyOTP,
sendEmail
};