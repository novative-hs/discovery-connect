const express = require('express');
const router = express.Router();
const quantityunitController = require("../controller/quantityunitController");

// Route for creating the quantityunit table
router.post('/create-quantityunit-table', quantityunitController.createQuantityUnitTable);

// Route to get all quantityunit
router.get('/get-quantityunit', quantityunitController.getAllQuantityUnit);

// Route to create a new quantityunit
router.post('/post-quantityunit', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, quantityunitController.createQuantityUnit);

// Route to update an existing quantityunit 
router.put('/put-quantityunit/:id', quantityunitController.updateQuantityUnit);
// Route to delete a quantityunit
router.delete('/delete-quantityunit/:id', quantityunitController.deleteQuantityUnit);

module.exports = router;
