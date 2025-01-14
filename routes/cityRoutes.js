const express = require('express');
const router = express.Router();
const cityController = require("../controller/cityController");

// Route for creating the committee_member table
router.post('/create-city-table', cityController.createCityTable);

// Route to get all committee members
router.get('/get-city', cityController.getAllCities);

// Route to create a new committee member
router.post('/post-city', cityController.createCity);

// Route to update an existing committee member
router.put('/put-city/:id', cityController.updateCity);
// Route to delete a committee member
router.delete('/delete-city/:id', cityController.deleteCity);

module.exports = router;
