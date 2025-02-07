

const concurrentmedicalconditionsModel = require("../models/concurrentmedicalconditionsModel");

// Controller for creating the Concurrent Medical Conditions table
const createConcurrentMedicalConditionsTable = (req, res) => {
    concurrentmedicalconditionsModel.createConcurrentMedicalConditionsTable();
  res.status(200).json({ message: "Concurrent Medical Conditions table creation process started" });
};

// Controller to get all Concurrent Medical Conditions
const getAllConcurrentMedicalConditions= (req, res) => {
    concurrentmedicalconditionsModel.getAllConcurrentMedicalConditions((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Concurrent Medical Conditions list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a ConcurrentMedicalConditions 
const createConcurrentMedicalConditions = (req, res) => {
    const newConcurrentMedicalConditionsData = req.body;
    console.log('Received Concurrent Medical Conditions Data:', newConcurrentMedicalConditionsData); // Log the incoming data for debugging
  
    // Pass the newConcurrentMedicalConditionsData directly to the model
    concurrentmedicalconditionsModel.createConcurrentMedicalConditions(newConcurrentMedicalConditionsData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Concurrent Medical Conditions" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Concurrent Medical Conditions added successfully", id: result.insertId });
    });
};

const updateConcurrentMedicalConditions = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  concurrentmedicalconditionsModel.updateConcurrentMedicalConditions(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Concurrent Medical Conditions " });
    }
    res.status(200).json({ message: "Concurrent Medical Conditions updated successfully" });
  });
};


// Controller to delete a ConcurrentMedicalConditions
const deleteConcurrentMedicalConditions= (req, res) => {
  const { id } = req.params;
  concurrentmedicalconditionsModel.deleteConcurrentMedicalConditions(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Concurrent Medical Conditions" });
    }
    res.status(200).json({ message: "Concurrent Medical Conditionsdeleted successfully" });
  });
};

module.exports = {
  createConcurrentMedicalConditionsTable,
  getAllConcurrentMedicalConditions,
  createConcurrentMedicalConditions,
  updateConcurrentMedicalConditions,
  deleteConcurrentMedicalConditions,
};
