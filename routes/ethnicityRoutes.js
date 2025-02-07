const express = require('express');
const router = express.Router();
const ethnicityController = require("../controller/ethnicityController");

// Route for creating the committee_member table
router.post('/create-ethnicity-table', ethnicityController.createEthnicityTable);

// Route to get all committee members
router.get('/get-ethnicity', ethnicityController.getAllEthnicity);

// Route to create a new ethnicity
router.post('/post-ethnicity', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, ethnicityController.createEthnicity);

// Route to update an existing ethnicity 
router.put('/put-ethnicity/:id', ethnicityController.updateEthnicity);
// Route to delete a ethnicity
router.delete('/delete-ethnicity/:id', ethnicityController.deleteEthnicity);

module.exports = router;
