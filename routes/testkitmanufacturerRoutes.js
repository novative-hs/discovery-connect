
const express = require('express');
const router = express.Router();
const testkitmanufacturerController = require("../controller/testkitmanufacturerController");

// Route for creating the testkitmanufacturer table
router.post('/create-testkitmanufacturer-table', testkitmanufacturerController.createTestKitManufacturerTable);

// Route to get all testkitmanufacturer
router.get('/get-testkitmanufacturer', testkitmanufacturerController.getAllTestKitManufacturer);

// Route to create a new testkitmanufacturer
router.post('/post-testkitmanufacturer', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testkitmanufacturerController. createTestKitManufacturer);

// Route to update an existing testkitmanufacturer 
router.put('/put-testkitmanufacturer/:id', testkitmanufacturerController.updateTestKitManufacturer);
// Route to delete a testkitmanufacturer
router.delete('/delete-testkitmanufacturer/:id', testkitmanufacturerController.deleteTestKitManufacturer);

module.exports = router;
