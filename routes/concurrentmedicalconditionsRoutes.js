
const express = require('express');
const router = express.Router();
const concurrentmedicalconditionsController = require("../controller/concurrentmedicalconditionsController");

// Route for creating the concurrentmedicalconditions table
router.post('/create-concurrentmedicalconditions-table', concurrentmedicalconditionsController.createConcurrentMedicalConditionsTable);

// Route to get all concurrentmedicalconditions
router.get('/get-concurrentmedicalconditions', concurrentmedicalconditionsController.getAllConcurrentMedicalConditions);

// Route to create a new concurrentmedicalconditions
router.post('/post-concurrentmedicalconditions', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, concurrentmedicalconditionsController.createConcurrentMedicalConditions);

// Route to update an existing concurrentmedicalconditions 
router.put('/put-concurrentmedicalconditions/:id', concurrentmedicalconditionsController.updateConcurrentMedicalConditions);
// Route to delete a concurrentmedicalconditions
router.delete('/delete-concurrentmedicalconditions/:id', concurrentmedicalconditionsController.deleteConcurrentMedicalConditions);

module.exports = router;
