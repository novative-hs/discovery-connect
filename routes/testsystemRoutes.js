
const express = require('express');
const router = express.Router();
const testsystemController = require("../controller/testsystemController");

// Route for creating the testsystem table
router.post('/create-testsystem-table', testsystemController.createTestSystemTable);

// Route to get all testsystem
router.get('/get-testsystem', testsystemController.getAllTestSystem);

// Route to create a new testsystem
router.post('/post-testsystem', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, testsystemController.createTestSystem);

// Route to update an existing testsystem 
router.put('/put-testsystem/:id', testsystemController.updateTestSystem);
// Route to delete a testsystem
router.delete('/delete-testsystem/:id', testsystemController.deleteTestSystem);

module.exports = router;
