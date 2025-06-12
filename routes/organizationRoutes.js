const express = require("express");
const router = express.Router();
const organizationController = require("../controller/organizationController");
const multer = require('multer');
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });


router.post('/create-organization-table', organizationController.create_organizationTable);

router.post(
  '/createorg',
  upload.fields([
    { name: 'logo', maxCount: 1 }
  ]),
  organizationController.createOrganization
);

router.get("/get", organizationController.getAllOrganizations);
router.get('/get/:id', organizationController.getCurrentOrganizationById);
router.get('/:id', organizationController.getOrganizationById);
router.put('/edit/:id', organizationController.updateOrganizationStatus);  // Route to update organization status (active/inactive)
router.put("/update/:id",upload.fields([
    { name: 'logo', maxCount: 1 }
  ]), organizationController.updateOrganization);

module.exports = router;
