const SampleModel = require('../models/sampleModel');
const moment = require('moment');

// Controller for creating the sample table
const createSampleTable = (req, res) => {
  SampleModel.createSampleTable();
  res.status(200).json({ message: "Sample table creation process started" });
};

// Controller to get all samples
const getAllSamples = (req, res) => {
  SampleModel.getAllSamples((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching samples" });
    }
    res.status(200).json(results);
  });
};

// Controller to get a sample by ID
const getSampleById = (req, res) => {
  const { id } = req.params;

  SampleModel.getSampleById(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching sample" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
    res.status(200).json(results[0]);
  });
};

// Controller to create a sample
const createSample = (req, res) => {
  const sampleData = req.body;

  // Required fields validation
  const requiredFields = [
    'masterID', 'donorID', 'samplename', 'age', 'gender', 'ethnicity',
    'samplecondition', 'storagetemp', 'storagetempUnit', 'ContainerType',
    'CountryOfCollection', 'price', 'SamplePriceCurrency', 'quantity',
    'QuantityUnit', 'labname', 'SampleTypeMatrix', 'TypeMatrixSubtype',
    'ProcurementType', 'endTime', 'SmokingStatus', 'TestMethod',
    'TestResult', 'TestResultUnit', 'InfectiousDiseaseTesting', 'InfectiousDiseaseResult',
  ];

  for (const field of requiredFields) {
    if (!sampleData[field]) {
      return res.status(400).json({ error: `Field "${field}" is required` });
    }
  }

  SampleModel.createSample(sampleData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error creating sample" });
    }
    res.status(201).json({ message: "Sample created successfully", id: result.insertId });
  });
};

// Controller to update a sample
const updateSample = (req, res) => {
  const { id } = req.params;
  const sampleData = req.body;

  // Format endTime if provided
  if (sampleData.endTime) {
    sampleData.endTime = moment(sampleData.endTime).format('YYYY-MM-DD HH:mm:ss');
  }

  SampleModel.updateSample(id, sampleData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating sample" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
    res.status(200).json({ message: "Sample updated successfully" });
  });
};

// Controller to delete a sample
const deleteSample = (req, res) => {
  const { id } = req.params;

  SampleModel.deleteSample(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting sample" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
    res.status(200).json({ message: "Sample deleted successfully" });
  });
};

module.exports = {
  createSampleTable,
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
};
