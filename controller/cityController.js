const cityModel = require("../models/cityModel");

// Controller for creating the committe_member table
const createCityTable = (req, res) => {
  cityModel.createCityTable();
  res.status(200).json({ message: "City table creation process started" });
};

// Controller to get all committee members
const getAllCities = (req, res) => {
  cityModel.getAllCities((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching city list" });
    }
    res.status(200).json(results);
  });
};
const getCount = (req, res) => {
  cityModel.getCount((err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error Geting All Counts" })
    }
    res.status(200).json(result);
  })
}
// Controller to create a committee member
const createCity = (req, res) => {
  const newCityData = req.body;
  console.log(newCityData)

  // Pass the newCityData directly to the model
  cityModel.createCity(newCityData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error creating City" });
    }
    res.status(201).json({ message: "City added successfully", id: result.insertId });
  });
};

const updateCity = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  cityModel.updateCity(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating city" });
    }
    res.status(200).json({ message: "City updated successfully" });
  });
};


// Controller to delete a committee member
const deleteCity = (req, res) => {
  const { id } = req.params;
  cityModel.deleteCity(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting city" });
    }
    res.status(200).json({ message: "City deleted successfully" });
  });
};

module.exports = {
  createCityTable,
  getAllCities,
  createCity,
  updateCity,
  deleteCity,
  getCount
};
