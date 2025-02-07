
const testsystemModel = require("../models/testsystemModel");

// Controller for creating the TestSystem table
const createTestSystemTable = (req, res) => {
    testsystemModel.createTestSystemTable();
  res.status(200).json({ message: "Test System table creation process started" });
};

// Controller to get all TestSystem
const getAllTestSystem= (req, res) => {
    testsystemModel.getAllTestSystem((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test System list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a TestSystem 
const createTestSystem = (req, res) => {
    const newTestSystemData = req.body;
    console.log('Received Test System Data:', newTestSystemData); // Log the incoming data for debugging
  
    // Pass the newTestSystemData directly to the model
    testsystemModel.createTestSystem(newTestSystemData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating TestSystem" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test System added successfully", id: result.insertId });
    });
};

const updateTestSystem = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testsystemModel.updateTestSystem(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test System " });
    }
    res.status(200).json({ message: "Test System updated successfully" });
  });
};


// Controller to delete a TestSystem
const deleteTestSystem= (req, res) => {
  const { id } = req.params;
  testsystemModel.deleteTestSystem(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test System" });
    }
    res.status(200).json({ message: "Test System deleted successfully" });
  });
};

module.exports = {
  createTestSystemTable,
  getAllTestSystem,
  createTestSystem,
  updateTestSystem,
  deleteTestSystem,
};
