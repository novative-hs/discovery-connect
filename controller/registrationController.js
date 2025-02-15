const accountModel = require("../models/registrationModel");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "Gmail", // You can replace it with any service you are using
  auth: {
    user: "khollaqureshi.pma.it@gmail.com ", // Your email
    pass: "bxec rtxs extp yyjg", // Your email password or app password
  },
});
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

const sendEmail = async (req, res) => {
  const { email, name, status } = req.body;

  // Default message for pending status
  let emailText = `Dear ${name},\n\nYour account status is currently pending. Please wait for approval.\n\nBest regards,\nYour Company`;

  // If status is 'approved', change the message
  if (status === "approved") {
    emailText = `Dear ${name},\n\nYour account has been approved! You can now log in and access your account.\n\nBest regards,\nYour Company`;
  }

  // If status is 'active', change the message
  else if (status === "active") {
    emailText = `Dear ${name},\n\nYour account is now active! You can log in and fully access your account.\n\nBest regards,\nYour Company`;
  }

  // If status is 'inactive', change the message
  else if (status === "inactive") {
    emailText = `Dear ${name},\n\nYour account is currently inactive. Please contact support for further assistance.\n\nBest regards,\nYour Company`;
  }

  // Email options
  const mailOptions = {
    from: "khollaqureshi.pma.it@gmail.com", // Sender address
    //to: email, // Recipient email
    to: "khollaqureshi.pma.it@gmail.com",
    subject: "Account Status Update", // Subject
    text: emailText, // Email body
  };

  try {
    // Sending email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Error sending email." });
  }
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

const changepassword = (req, res) => {
  const { email, password, newPassword } = req.body;

  if (!email || !password || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userData = { email, password, newPassword };

  accountModel.changepassword(userData, (err, result) => {
    if (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
    res.status(200).json(result);
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
  sendEmail,
};