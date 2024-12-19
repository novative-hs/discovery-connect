const express = require("express");
const router = express.Router();
const organizationController = require("../controller/organizationController");

// Route to create the organization table
router.get("/create-organization-table", organizationController.createOrganizationTable);

// Route to get all organizations
router.get("/get", organizationController.getAllOrganizations);

// Route to update organization status
router.put("/edit/:id", organizationController.updateOrganizationStatus);

module.exports = router;
