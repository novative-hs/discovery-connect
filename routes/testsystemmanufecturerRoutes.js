
const express = require('express');
const router = express.Router();
const testsystemmanufacturerController = require("../controller/testsystemmanufacturerController");

// Route for creating the testsystemmanufecturer table
router.post('/create-testsystemmanufacturer-table', testsystemmanufacturerController.createTestSystemManufecturerTable);

// Route to get all testsystemmanufecturer
router.get('/get-testsystemmanufacturer', testsystemmanufacturerController.getAllTestSystemManufecturer);

// Route to create a new quantityunit
router.post('/post-testsystemmanufacturer', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testsystemmanufacturerController.createTestSystemManufecturer);

// Route to update an existing testsystemmanufecturer 
router.put('/put-testsystemmanufacturer/:id', testsystemmanufacturerController.updateTestSystemManufecturer);
// Route to delete a testsystemmanufecturer
router.delete('/delete-testsystemmanufacturer/:id', testsystemmanufacturerController.deleteTestSystemManufecturer);

module.exports = router;
