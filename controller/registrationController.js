const accountModel = require("../models/registrationModel");
const nodemailer = require("nodemailer");

// Controller for creating the committe_member table
const createuser_accountTable = (req, res) => {
  accountModel.createuser_accountTable();
  res.status(200).json({ message: "Acounts table creation process started" });
};

const create_researcherTable = (req, res) => {
  accountModel.create_researcherTable();
  res
    .status(200)
    .json({ message: "Researcher table creation process started" });
};


const create_organizationTable = (req, res) => {
  accountModel.create_organizationTable();
  res
    .status(200)
    .json({ message: "Organization table creation process started" });
};

const create_collectionsiteTable = (req, res) => {
  accountModel.create_collectionsiteTable();
  res
    .status(200)
    .json({ message: "Collection Site table creation process started" });
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
  console.log("Received Account Data:", req.body);

  accountModel.sendOTP(req, (err, result) => {
    if (err) {
      console.error("Error:", err);
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

  accountModel.verifyOTP(email, otp, (err, isVerified) => { // 🔹 Change result to isVerified
    if (err) {
      console.error("❌ Error verifying OTP:", err);
      return res.status(500).json({ message: "Failed to verify OTP", error: err.message });
    }

    if (!isVerified) { // 🔹 Use isVerified instead of result.otp
      return res.status(401).json({ message: "Invalid OTP. Please try again." });
    }

    res.status(200).json({ message: "✅ OTP verified successfully!" });
  });
};

const createAccount = (req, res) => {
  console.log("Received Account Data:", req.body);

  accountModel.createAccount(req, (err, result) => {
    if (err) {
      console.error("Error:", err);
      if (err.message === "Email already exists") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: "Error creating account" });
    }

    console.log("Insert Result:", result);
    res.status(201).json(result);
  });
};

const loginAccount = (req, res) => {
  const { email, password } = req.body;

  console.log("Received Login Data:", { email, password });

  accountModel.loginAccount({ email, password }, (err, result) => {
    if (err) {
      console.error("Error:", err);
      if (err.message === "Email and password are required") {
        return res.status(400).json({ status: "fail", error: err.message });
      }
      if (err.message === "Invalid email or password") {
        return res.status(401).json({ status: "fail", error: err.message });
      }
      if (err.message === "Account is not approved") {
        return res.status(403).json({ status: "fail", error: err.message });
      }
      return res
        .status(500)
        .json({ status: "fail", error: "Internal server error" });
    }

    console.log("Login Successful:", result);
    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: result.id,
        accountType: result.accountType,
        email: result.email,
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
  console.log("Received Account Data:", req.body);

  accountModel.updateAccount(req, (err, result) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: "Error creating account" });
    }

    console.log("Insert Result:", result);
    res.status(201).json(result);
  });
};

module.exports = {
  changepassword,
  loginAccount,
  getUserEmail,
  create_collectionsiteTable,
  create_organizationTable,
  create_researcherTable,
  createuser_accountTable,
  createAccount,
  getAccountDetail,
  updateAccount,
  getEmail,
  sendOTP,
  verifyOTP

};