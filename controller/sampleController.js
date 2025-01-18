const SampleModel = require('../models/sampleModel');

const moment = require('moment');

// Controller for creating the sample table
const createSampleTable = (req, res) => {
  SampleModel.createSampleTable();

  res.status(200).json({ message: "Sample table creation process started" });
};


// Controller to get all samples
const getSamples = (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }
  SampleModel.getSamples(id, (err, results) => {
    if (err) {
      console.error('Error in model:', err);
      return res.status(500).json({ error: "Error fetching samples" });
    }
    res.status(200).json(results);
  });
};

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
  console.log("Controller Received data:", sampleData);

  // Required fields validation
  const requiredFields = [
    'masterID', 'donorID', 'samplename', 'age', 'gender', 'ethnicity',
    'samplecondition', 'storagetemp', 'storagetempUnit', 'ContainerType',
    'CountryOfCollection', 'price', 'SamplePriceCurrency', 'quantity',
    'QuantityUnit', 'labname', 'SampleTypeMatrix', 'TypeMatrixSubtype',
    'ProcurementType', 'SmokingStatus', 'TestMethod',
    'TestResult', 'TestResultUnit', 'InfectiousDiseaseTesting', 'InfectiousDiseaseResult',
    'CutOffRange', 'CutOffRangeUnit', 'FreezeThawCycles', 'DateOfCollection',
    'ConcurrentMedicalConditions', 'ConcurrentMedications', 'AlcoholOrDrugAbuse',
    'DiagnosisTestParameter', 'ResultRemarks', 'TestKit', 'TestKitManufacturer',
    'TestSystem', 'TestSystemManufacturer', 'endTime'
  ];

  for (const field of requiredFields) {
    if (!sampleData[field]) {
      return res.status(400).json({ error: `Field "${field}" is required` });
    }
  }

  // DateOfCollection will show data only before today
  const today = new Date();
  const dateOfCollection = new Date(sampleData.DateOfCollection);

  if (dateOfCollection >= today) {
    return res.status(400).json({ error: "DateOfCollection must be before today" });
  }

  // endTime will show data only after today
  const endTime = new Date(sampleData.endTime);
  if (endTime <= today) {
    return res.status(400).json({ error: "endTime must be after today" });
  }

  console.log("Fields validated, executing insert...");

  SampleModel.createSample(sampleData, (err, result) => {
    if (err) {
      console.error('Error creating sample:', err);
      return res.status(500).json({ error: "Error creating sample" });
    }
    console.log("Sample created, result:", result);
    res.status(201).json({ message: "Sample created successfully", id: result.insertId });
  });
};

// Controller to update a sample
const updateSample = (req, res) => {
  const { id } = req.params;
  const sampleData = req.body;

  // Format endTime if provided
  if (sampleData.endTime) {
    sampleData.endTime = moment(sampleData.endTime).format('YYYY-MM-DD');

  }
  if (sampleData.DateOfCollection) {
    sampleData.DateOfCollection = moment(sampleData.DateOfCollection).format('YYYY-MM-DD');
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
  getSamples,
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
};