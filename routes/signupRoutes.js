const express = require("express");
const router = express.Router();
const signupController = require("../controller/signupController");

// Route for user signup
router.post("/signup", signupController.userSignup);

module.exports = router;
