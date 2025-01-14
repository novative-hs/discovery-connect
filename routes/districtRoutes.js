const express = require('express');
const router = express.Router();
const distictController = require("../controller/districtController");

// Route for creating the committee_member table
router.post('/create-district-table', distictController.createDistrictTable);

// Route to get all committee members
router.get('/get-district', distictController.getAllDistricts);

// Route to create a new committee member
router.post('/post-district', distictController.createDistrict);

// Route to update an existing committee member
router.put('/put-district/:id', distictController.updateDistrict);
// Route to delete a committee member
router.delete('/delete-district/:id', distictController.deleteDistrict);

module.exports = router;
