const express = require('express');
const router = express.Router();
const sampleconditionController = require("../controller/sampleconditionController");

// Route for creating the committee_member table
router.post('/create-samplecondition-table', sampleconditionController.createSampleCondition);

// Route to get all committee members
router.get('/get-samplecondition', sampleconditionController.getAllSampleCondition);

// Route to create a new ethnicity
router.post('/post-samplecondition', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, sampleconditionController.createSampleCondition);

// Route to update an existing ethnicity 
router.put('/put-samplecondition/:id', sampleconditionController.updateSampleCondition);
// Route to delete a ethnicity
router.delete('/delete-samplecondition/:id', sampleconditionController.deleteSampleCondition);

module.exports = router;
