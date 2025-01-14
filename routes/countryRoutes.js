const express = require('express');
const router = express.Router();
const countryController = require("../controller/countryController");

// Route for creating the country table
router.post('/create-country-table', countryController.createCountryTable);

// Route to get all country members
router.get('/get-country', countryController.getAllCountries);

// Route to create a new country member
router.post('/post-country', countryController.createCountry);

// Route to update an existing country member
router.put('/put-country/:id', countryController.updateCountry);
// Route to delete a country member
router.delete('/delete-country/:id', countryController.deleteCountry);

module.exports = router;
