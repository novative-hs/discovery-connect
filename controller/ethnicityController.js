
const ethnicityModel = require("../models/ethnicityModel");

// Controller for creating the committe_member table
const createEthnicityTable = (req, res) => {
    ethnicityModel.createEthnicityTable();
  res.status(200).json({ message: "Ethnicity table creation process started" });
};

// Controller to get all committee members
const getAllEthnicity = (req, res) => {
    ethnicityModel.getAllEthnicity((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Ethnicity list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createEthnicity = (req, res) => {
    const newEthnicityData = req.body;
    console.log('Received Ethnicity Data:', newEthnicityData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    ethnicityModel.createEthnicity(newEthnicityData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Ethnicity" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Ethnicity added successfully", id: result.insertId });
    });
};

const updateEthnicity = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  ethnicityModel.updateEthnicity(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Ethnicity" });
    }
    res.status(200).json({ message: "Ethnicity updated successfully" });
  });
};


// Controller to delete a committee member
const deleteEthnicity = (req, res) => {
  const { id } = req.params;
  ethnicityModel.deleteEthnicity(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Ethnicity" });
    }
    res.status(200).json({ message: "Ethnicity deleted successfully" });
  });
};

module.exports = {
  createEthnicityTable,
  getAllEthnicity,
  createEthnicity,
  updateEthnicity,
  deleteEthnicity,
};
