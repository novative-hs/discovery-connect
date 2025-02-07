
const containertypeModel = require("../models/containertypeModel");

// Controller for creating the committe_member table
const createContainerTypeTable = (req, res) => {
    containertypeModel.createContainerTypeTable();
  res.status(200).json({ message: "Container Type table creation process started" });
};

// Controller to get all committee members
const getAllContainerType= (req, res) => {
    containertypeModel.getAllContainerType((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Container Type list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createContainerType = (req, res) => {
    const newContainerTypeData = req.body;
    console.log('Received Container Type Data:', newContainerTypeData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    containertypeModel.createContainerType(newContainerTypeData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Container Type" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Container Type added successfully", id: result.insertId });
    });
};

const updateContainerType = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  containertypeModel.updateContainerType(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Container Type" });
    }
    res.status(200).json({ message: "Container Type updated successfully" });
  });
};


// Controller to delete a committee member
const deleteContainerType = (req, res) => {
  const { id } = req.params;
  containertypeModel.deleteContainerType(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Container Type" });
    }
    res.status(200).json({ message: "Container Type deleted successfully" });
  });
};

module.exports = {
  createContainerTypeTable,
  getAllContainerType,
  createContainerType,
  updateContainerType,
  deleteContainerType,
};
