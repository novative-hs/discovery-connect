
const testsystemmanufecturerModel = require("../models/testsystemmanufacturerModel");

// Controller for creating the TestSystemManufecturer table
const createTestSystemManufecturerTable = (req, res) => {
    testsystemmanufecturerModel.createTestSystemManufecturerTable();
  res.status(200).json({ message: "Test System Manufecturer table creation process started" });
};

// Controller to get all TestSystemManufecturer
const getAllTestSystemManufecturer= (req, res) => {
    testsystemmanufecturerModel.getAllTestSystemManufecturer((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching TestSystemManufecturer list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a TestSystemManufecturer 
const createTestSystemManufecturer = (req, res) => {
    const newTestSystemManufecturerData = req.body;
    console.log('Received TestSystemManufecturer Data:', newTestSystemManufecturerData); // Log the incoming data for debugging
  
    // Pass the newTestSystemManufecturerData directly to the model
    testsystemmanufecturerModel.createTestSystemManufecturer(newTestSystemManufecturerData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating TestSystemManufecturer" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test System Manufecturer added successfully", id: result.insertId });
    });
};

const updateTestSystemManufecturer = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testsystemmanufecturerModel.updateTestSystemManufecturer(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test System Manufecturer " });
    }
    res.status(200).json({ message: "Test System Manufecturerupdated successfully" });
  });
};


// Controller to delete a TestSystemManufecturer
const deleteTestSystemManufecturer= (req, res) => {
  const { id } = req.params;
  testsystemmanufecturerModel.deleteTestSystemManufecturer(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test System Manufecturer" });
    }
    res.status(200).json({ message: "Test System Manufecturer deleted successfully" });
  });
};

module.exports = {
  createTestSystemManufecturerTable,
  getAllTestSystemManufecturer,
  createTestSystemManufecturer,
  updateTestSystemManufecturer,
  deleteTestSystemManufecturer,
};
