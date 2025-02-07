
const testmethodModel = require("../models/testmethodModel");

// Controller for creating the TestMethod table
const createTestMethodTable = (req, res) => {
    testmethodModel.createTestMethodTable();
  res.status(200).json({ message: "Test Method table creation process started" });
};

// Controller to get all TestMethod
const getAllTestMethod= (req, res) => {
    testmethodModel.getAllTestMethod((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test Method list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a TestMethod 
const createTestMethod = (req, res) => {
    const newTestMethodData = req.body;
    console.log('Received Test Method Data:', newTestMethodData); // Log the incoming data for debugging
  
    // Pass the newTestMethodData directly to the model
    testmethodModel.createTestMethod(newTestMethodData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Test Method" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test Method added successfully", id: result.insertId });
    });
};

const updateTestMethod = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testmethodModel.updateTestMethod(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test Method" });
    }
    res.status(200).json({ message: "Test Method updated successfully" });
  });
};


// Controller to delete a TestMethod
const deleteTestMethod= (req, res) => {
  const { id } = req.params;
  testmethodModel.deleteTestMethod(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test Method" });
    }
    res.status(200).json({ message: "Test Method deleted successfully" });
  });
};

module.exports = {
  createTestMethodTable,
  getAllTestMethod,
  createTestMethod,
  updateTestMethod,
  deleteTestMethod,
};
