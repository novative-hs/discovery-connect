
const storagetemperatureModel = require("../models/storagetemperatureModel");

// Controller for creating the committe_member table
const createStorageTemperatureTable = (req, res) => {
    storagetemperatureModel.createStorageTemperatureTable();
  res.status(200).json({ message: "Storage Temperature table creation process started" });
};

// Controller to get all committee members
const getAllStorageTemperature = (req, res) => {
    storagetemperatureModel.getAllStorageTemperature((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Storage Temperature list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createStorageTemperature = (req, res) => {
    const newStorageTemperatureData = req.body;
    console.log('Received Storage Temperature Data:', newStorageTemperatureData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    storagetemperatureModel.createStorageTemperature(newStorageTemperatureData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Storage Temperature" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Storage Temperature added successfully", id: result.insertId });
    });
};

const updateStorageTemperature = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  storagetemperatureModel.updateStorageTemperature(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Storage Temperature" });
    }
    res.status(200).json({ message: "Storage Temperature updated successfully" });
  });
};


// Controller to delete a committee member
const deleteStorageTemperature = (req, res) => {
  const { id } = req.params;
  storagetemperatureModel.deleteStorageTemperature(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Storage Temperature" });
    }
    res.status(200).json({ message: "Storage Temperature deleted successfully" });
  });
};

module.exports = {
  createStorageTemperatureTable,
  getAllStorageTemperature,
  createStorageTemperature,
  updateStorageTemperature,
  deleteStorageTemperature,
};
