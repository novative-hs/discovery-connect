
const quantityunitModel = require("../models/quantityunitModel");

// Controller for creating the committe_member table
const createQuantityUnitTable = (req, res) => {
    quantityunitModel.createQuantityUnitTable();
  res.status(200).json({ message: "Quantity Unit table creation process started" });
};

// Controller to get all committee members
const getAllQuantityUnit= (req, res) => {
    quantityunitModel.getAllQuantityUnit((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Quantity Unit list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a Quantity Unit
const createQuantityUnit = (req, res) => {
    const newQuantityUnitData = req.body;
    console.log('Received Quantity Unit Data:', newQuantityUnitData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    quantityunitModel.createQuantityUnit(newQuantityUnitData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Quantity Unit" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "Quantity Unit added successfully", id: result.insertId });
    });
};

const updateQuantityUnit = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  quantityunitModel.updatequantityunit(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Quantity Unit" });
    }
    res.status(200).json({ message: "Quantity Unit updated successfully" });
  });
};


// Controller to delete a committee member
const deleteQuantityUnit = (req, res) => {
  const { id } = req.params;
  quantityunitModel.deleteQuantityUnit(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Quantity Unit" });
    }
    res.status(200).json({ message: "Quantity Unit deleted successfully" });
  });
};

module.exports = {
  createQuantityUnitTable,
  getAllQuantityUnit,
  createQuantityUnit,
  updateQuantityUnit,
  deleteQuantityUnit,
};
