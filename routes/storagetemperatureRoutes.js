const express = require('express');
const router = express.Router();
const storagetemperatureController = require("../controller/storagetemperatureController");

// Route for creating the storagetemperature table
router.post('/create-storagetemperature-table', storagetemperatureController.createStorageTemperature);

// Route to get all storagetemperature
router.get('/get-storagetemperature', storagetemperatureController.getAllStorageTemperature);

// Route to create a new storagetemperature
router.post('/post-storagetemperature', (req, res, next) => {
    console.log('Middleware Log - Received Body:', req.body); // Debugging
    next();
  }, storagetemperatureController.createStorageTemperature);

// Route to update an existing storagetemperature
router.put('/put-storagetemperature/:id', storagetemperatureController.updateStorageTemperature);
// Route to delete a storagetemperature
router.delete('/delete-storagetemperature/:id', storagetemperatureController.deleteStorageTemperature);

module.exports = router;
