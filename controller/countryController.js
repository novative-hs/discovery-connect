const countryModel = require("../models/countryModel");

// Controller for creating the committe_member table
const createCountryTable = (req, res) => {
  countryModel.createCountryTable();
  res.status(200).json({ message: "Country table creation process started" });
};

// Controller to get all committee members
const getAllCountries = (req, res) => {
 countryModel.getAllCountries((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Country list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createCountry = (req, res) => {
    const newCountryData = req.body;
    console.log('Received Country Data:', newCountryData); // Log the incoming data for debugging
  
    // Pass the newCountryData directly to the model
    countryModel.createCountry(newCountryData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Country" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Country added successfully", id: result.insertId });
    });
};

const updateCountry = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  countryModel.updateCountry(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Country" });
    }
    res.status(200).json({ message: "Country updated successfully" });
  });
};


// Controller to delete a committee member
const deleteCountry = (req, res) => {
  const { id } = req.params;
  countryModel.deleteCountry(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Country" });
    }
    res.status(200).json({ message: "Country deleted successfully" });
  });
};

module.exports = {
  createCountryTable,
  getAllCountries,
  createCountry,
  updateCountry,
  deleteCountry
};
