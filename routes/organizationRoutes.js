const express = require("express");
const router = express.Router();
const organizationController = require("../controller/organizationController");
// Route to get all organizations
router.get("/get", organizationController.getAllOrganizations);
router.get('/get/:id', organizationController.getCurrentOrganizationById);
router.get('/:id', organizationController.getOrganizationById);
router.delete('/edit/:id', organizationController.updateOrganizationStatus);  // Route to update organization status (active/inactive)
router.put("/update/:id", organizationController.updateOrganization);

module.exports = router;
