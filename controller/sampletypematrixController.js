
const sampletypematrixModel = require("../models/sampletypematrixModel");

// Controller for creating the SampleTypeMatrix table
const createSampleTypeMatrixTable = (req, res) => {
    sampletypematrixModel.createSampleTypeMatrixTable();
  res.status(200).json({ message: "Sample Type Matrix table creation process started" });
};

// Controller to get all SampleTypeMatrix
const getAllSampleTypeMatrix= (req, res) => {
    sampletypematrixModel.getAllSampleTypeMatrix((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Sample Type Matrix list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a SampleTypeMatrix 
const createSampleTypeMatrix = (req, res) => {
    const newSampleTypeMatrixData = req.body;
    console.log('Received Sample Type Matrix Data:', newSampleTypeMatrixData); // Log the incoming data for debugging
  
    // Pass the newSampleTypeMatrixData directly to the model
    sampletypematrixModel.createSampleTypeMatrix(newSampleTypeMatrixData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Sample Type Matrix" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Sample Type Matrix added successfully", id: result.insertId });
    });
};

const updateSampleTypeMatrix = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  sampletypematrixModel.updateSampleTypeMatrix(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Sample Type Matrix " });
    }
    res.status(200).json({ message: "Sample Type Matrix updated successfully" });
  });
};


// Controller to delete a SampleTypeMatrix
const deleteSampleTypeMatrix= (req, res) => {
  const { id } = req.params;
  sampletypematrixModel.deleteSampleTypeMatrix(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Sample Type Matrix" });
    }
    res.status(200).json({ message: "Sample Type Matrix deleted successfully" });
  });
};

module.exports = {
  createSampleTypeMatrixTable,
  getAllSampleTypeMatrix,
  createSampleTypeMatrix,
  updateSampleTypeMatrix,
  deleteSampleTypeMatrix,
};
