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
      console.log("User Found:", user);  // Log the user object
      res.status(200).json({ status: "success", message: "Login successful", user });
    } else {
      console.log("No matching user found.");
      res.status(401).json({ status: "fail", error: "Invalid email or password" });
    }
  });
}

module.exports = {
  userLogin,
};
