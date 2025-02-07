
const sampleconditionModel = require("../models/sampleconditionModel");

// Controller for creating the committe_member table
const createSampleConditionTable = (req, res) => {
    sampleconditionModel.createSampleConditionTable();
  res.status(200).json({ message: "Sample Condition table creation process started" });
};

// Controller to get all committee members
const getAllSampleCondition = (req, res) => {
    sampleconditionModel.getAllSampleCondition((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Sample Condition list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createSampleCondition = (req, res) => {
    const newSampleConditionData = req.body;
    console.log('Received Sample Condition Data:', newSampleConditionData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    sampleconditionModel.createSampleCondition(newSampleConditionData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Sample Condition" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Sample Condition added successfully", id: result.insertId });
    });
};

const updateSampleCondition = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  sampleconditionModel.updateSampleCondition(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Sample Condition" });
    }
    res.status(200).json({ message: "Sample Condition updated successfully" });
  });
};


// Controller to delete a committee member
const deleteSampleCondition = (req, res) => {
  const { id } = req.params;
  sampleconditionModel.deleteSampleCondition(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Sample Condition" });
    }
    res.status(200).json({ message: "Sample Condition deleted successfully" });
  });
};

module.exports = {
  createSampleConditionTable,
  getAllSampleCondition,
  createSampleCondition,
  updateSampleCondition,
  deleteSampleCondition,
};
