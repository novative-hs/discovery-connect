
const testkitmanufacturerModel = require("../models/testkitmanufacturerModel");

// Controller for creating the TestKitManufacturer table
const createTestKitManufacturerTable = (req, res) => {
    testkitmanufacturerModel.createTestKitManufacturerTable();
  res.status(200).json({ message: "Test Kit Manufacturer table creation process started" });
};

// Controller to get all TestKitManufacturer
const getAllTestKitManufacturer= (req, res) => {
    testkitmanufacturerModel.getAllTestKitManufacturer((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Test Kit Manufacturer" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a TestKitManufacturer 
const createTestKitManufacturer = (req, res) => {
    const newTestKitManufacturerData = req.body;
    console.log('Received Test Kit Manufacturer Data:', newTestKitManufacturerData); // Log the incoming data for debugging
  
    // Pass the newTestKitManufacturerData directly to the model
    testkitmanufacturerModel.createTestKitManufacturer(newTestKitManufacturerData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Test Kit Manufacturer" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Test KitManufacturer added successfully", id: result.insertId });
    });
};

const updateTestKitManufacturer = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  testkitmanufacturerModel.updateTestKitManufacturer(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Test Kit Manufacturer" });
    }
    res.status(200).json({ message: "Test KitManufacturer updated successfully" });
  });
};


// Controller to delete a TestKitManufacturer
const deleteTestKitManufacturer= (req, res) => {
  const { id } = req.params;
  testkitmanufacturerModel.deleteTestKitManufacturer(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Test Kit Manufacturer" });
    }
    res.status(200).json({ message: "Test Kit Manufacturer  deleted successfully" });
  });
};

module.exports = {
  createTestKitManufacturerTable,
  getAllTestKitManufacturer,
  createTestKitManufacturer,
  updateTestKitManufacturer,
  deleteTestKitManufacturer,
};
