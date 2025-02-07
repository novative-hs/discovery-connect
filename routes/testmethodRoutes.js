
const express = require('express');
const router = express.Router();
const testmethodController = require("../controller/testmethodController");

// Route for creating the testmethod table
router.post('/create-testmethod-table', testmethodController. createTestMethodTable);

// Route to get all testmethod
router.get('/get-testmethod', testmethodController.getAllTestMethod);

// Route to create a new testmethod
router.post('/post-testmethod', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testmethodController.createTestMethod);

// Route to update an existing testmethod 
router.put('/put-testmethod/:id', testmethodController.updateTestMethod);
// Route to delete a testmethod
router.delete('/delete-testmethod/:id', testmethodController.deleteTestMethod);

module.exports = router;
