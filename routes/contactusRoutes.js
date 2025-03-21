const express = require("express");
const router = express.Router();
const contactusController = require("../controller/contactusController");

router.post("/contactus", contactusController.submitContactForm);

module.exports = router;
