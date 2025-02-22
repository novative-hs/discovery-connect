
const samplefieldsModel = require("../models/samplefieldsModel");
const getAllSampleFields = (req, res) => {
  const { tableName } = req.params; // Get table name from request parameters

  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  samplefieldsModel.getAllSampleFields(tableName, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching sample fields list" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a sample field dynamically
const createSampleFields = (req, res) => {
  const { tableName } = req.params;
  const newSampleFieldsData = req.body;

  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  console.log("Received Data:", newSampleFieldsData);

  samplefieldsModel.createSampleFields(tableName, newSampleFieldsData, (err, result) => {
    if (err) {
      console.log("Error:", err);
      return res.status(500).json({ error: "Error creating sample fields" });
    }
    console.log("Insert Result:", result);
    res.status(201).json({ message: "Sample fields added successfully", id: result.insertId });
  });
};

// Controller to update a sample field dynamically
const updateSampleFields = (req, res) => {
  const { tableName, id } = req.params;
  const updatedData = req.body;

  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  samplefieldsModel.updateSampleFields(tableName, id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating sample fields" });
    }
    res.status(200).json({ message: "Sample fields updated successfully" });
  });
};

// Controller to delete (soft delete) a sample field dynamically
const deleteSampleFields = (req, res) => {
  const { tableName, id } = req.params;

  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  samplefieldsModel.deleteSampleFields(tableName, id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting sample fields" });
    }
    res.status(200).json({ message: "Sample fields deleted successfully" });
  });
};

// Controller to fetch sample field names dynamically
const getSampleFieldsNames = (req, res) => {
  const { tableName } = req.params;

  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  samplefieldsModel.getSampleFieldsNames(tableName, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "An error occurred while fetching data" });
    }

    const sampleFieldsNames = results.map((row) => row.name);
    res.status(200).json(sampleFieldsNames);
  });
};


module.exports = {
  getAllSampleFields, createSampleFields, updateSampleFields, deleteSampleFields, getSampleFieldsNames,
};
