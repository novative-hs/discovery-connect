const districtModel = require("../models/districtModel");

// Controller for creating the committe_member table
const createDistrictTable = (req, res) => {
  districtModel.createDistrictTable();
  res.status(200).json({ message: "District table creation process started" });
};

// Controller to get all committee members
const getAllDistricts = (req, res) => {
 districtModel.getAllDistricts((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching District list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createDistrict = (req, res) => {
    const newCityData = req.body;
    console.log('Received District Data:', newCityData); // Log the incoming data for debugging
  
    // Pass the newCityData directly to the model
    districtModel.createDistrict(newCityData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating district" });
      }
      console.log('Insert Result:', result); // Log the result for debugging
      res.status(201).json({ message: "District added successfully", id: result.insertId });
    });
};

const updateDistrict = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  districtModel.updateDistrict(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating city" });
    }
    res.status(200).json({ message: "District updated successfully" });
  });
};


// Controller to delete a committee member
const deleteDistrict = (req, res) => {
  const { id } = req.params;
  districtModel.deleteDistrict(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting district" });
    }
    res.status(200).json({ message: "District deleted successfully" });
  });
};

module.exports = {
  createDistrictTable,
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict
};
