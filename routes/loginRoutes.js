const express = require("express");
const router = express.Router();
const loginController = require("../controller/loginController");

// Route for user login
router.post("/login", loginController.userLogin);

module.exports = router;
