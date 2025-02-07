const express = require('express');

const router = express.Router();
const testresultunitController = require("../controller/testresultunitController");

// Route for creating the testresultunit table
router.post('/create-testresultunit-table', testresultunitController.createTestResultUnitTable);

// Route to get all testresultunit
router.get('/get-testresultunit', testresultunitController.getAllTestResultUnit);

// Route to create a new testresultunit
router.post('/post-testresultunit', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testresultunitController.createTestResultUnit);

// Route to update an existing testresultunit 
router.put('/put-testresultunit/:id', testresultunitController.updateTestResultUnit);
// Route to delete a testresultunit
router.delete('/delete-testresultunit/:id', testresultunitController.deleteTestResultUnit);

module.exports = router;
