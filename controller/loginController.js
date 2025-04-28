const loginModel = require("../models/loginModel");

function userLogin(req, res) {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ status: "fail", error: "Email and password are required" });
  }

  // Call the model function to verify user credentials
  loginModel.verifyUserLogin(email, password, (err, results) => {
    if (err) {
      console.error("Error during database query:", err.message);
      return res.status(500).json({ status: "fail", error: err.message });
    }

    // Check if any results were returned
    if (results.length > 0) {
      const user = results[0];  // Assuming one user matches the credentials
      
      res.status(200).json({ status: "success", message: "Login successful", user });
    } else {
  
      res.status(401).json({ status: "fail", error: "Invalid email or password" });
    }
  });
}
const getTableCounts = (req, res) => {
  accountModel.getTableCounts((err, result) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ status: "fail", error: err.message });
    }
    res.status(200).json(result); // Send the counts as a JSON response
  });
};
module.exports = {
  userLogin,
  getTableCounts
};