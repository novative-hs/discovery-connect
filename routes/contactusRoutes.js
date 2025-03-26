const express = require("express");
const router = express.Router();
const contactusController = require("../controller/contactusController");

router.post("/contactus", contactusController.submitContactForm);
router.get("/contactus/get-all",contactusController.getallContactus)

module.exports = router;
