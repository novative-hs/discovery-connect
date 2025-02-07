
const testresultunitModel = require("../models/testresultunitModel");

// Controller for creating the TestResultUnit table
const createTestResultUnitTable = (req, res) => {
    testresultunitModel.createTestResultUnitTable();
  res.status(200).json({ message: "Test Result Unit table creation process started" });
};

// Controller to get all TestResultUnit
const getAllTestResultUnit= (req, res) => {
    testresultunitModel.getAllTestResultUnit((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test Result Unit list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a TestResultUnit 
const createTestResultUnit = (req, res) => {
    const newTestResultUnitData = req.body;
    console.log('Received Test ResultUnit Data:', newTestResultUnitData); // Log the incoming data for debugging
  
    // Pass the newTestResultUnitData directly to the model
    testresultunitModel.createTestResultUnit(newTestResultUnitData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Test ResultUnit" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test ResultUnit added successfully", id: result.insertId });
    });
};

const updateTestResultUnit = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testresultunitModel.updateTestResultUnit(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test ResultUnit" });
    }
    res.status(200).json({ message: "Test ResultUnit updated successfully" });
  });
};


// Controller to delete a TestResultUnit
const deleteTestResultUnit= (req, res) => {
  const { id } = req.params;
  testresultunitModel.deleteTestResultUnit(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test ResultUnit" });
    }
    res.status(200).json({ message: "Test Result Unit  deleted successfully" });
  });
};

module.exports = {
  createTestResultUnitTable,
  getAllTestResultUnit,
  createTestResultUnit,
  updateTestResultUnit,
  deleteTestResultUnit,
};
