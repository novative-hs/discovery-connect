
const express = require('express');
const router = express.Router();
const sampletypematrixController = require("../controller/sampletypematrixController");

// Route for creating the sampletypematrix table
router.post('/create-sampletypematrix-table', sampletypematrixController.createSampleTypeMatrixTable);

// Route to get all sampletypematrix
router.get('/get-sampletypematrix', sampletypematrixController.getAllSampleTypeMatrix);

// Route to create a new sampletypematrix
router.post('/post-sampletypematrix', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, sampletypematrixController.createSampleTypeMatrix);

// Route to update an existing sampletypematrix 
router.put('/put-sampletypematrix/:id', sampletypematrixController.updateSampleTypeMatrix);
// Route to delete a sampletypematrix
router.delete('/delete-sampletypematrix/:id', sampletypematrixController.deleteSampleTypeMatrix);

module.exports = router;
