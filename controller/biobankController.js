const BioBankModel = require('../models/biobankModel');
const moment = require('moment');

// Controller to create a sample
const getBiobankSamples = (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }
  BioBankModel.getBiobankSamples(id, (err, results) => {
    if (err) {
      console.error('Error in model:', err);
      return res.status(500).json({ error: "Error fetching samples" });
    }
    res.status(200).json(results);
  });
};

const getQuarantineStock = (req, res) => {
  BioBankModel.getQuarantineStock((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Quarantine Stock" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a sample
const createBiobankSample = (req, res) => {
  const sampleData = req.body;
  const file = req.file;

  // Attach file buffer to the sampleData
  sampleData.logo = file?.buffer;

  // Required fields validation
  const requiredFields = [
    'donorID', 'samplename', 'age', 'gender', 'ethnicity', 'samplecondition', 'storagetemp', 'ContainerType', 'CountryOfCollection', 'price', 'SamplePriceCurrency', 'quantity', 'QuantityUnit', 'SampleTypeMatrix', 'SmokingStatus', 'AlcoholOrDrugAbuse', 'InfectiousDiseaseTesting', 'InfectiousDiseaseResult', 'FreezeThawCycles', 'DateOfCollection', 'ConcurrentMedicalConditions', 'ConcurrentMedications', 'DiagnosisTestParameter', 'TestResult', 'TestResultUnit', 'TestMethod', 'TestKitManufacturer', 'TestSystem', 'TestSystemManufacturer'
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


  BioBankModel.createBiobankSample(sampleData, (err, result) => {
    if (err) {
      console.error('Error creating sample:', err);
      return res.status(500).json({ error: "Error creating sample" });
    }
    res.status(201).json({ message: "Sample created successfully", id: result.insertId });
  });
};

// Controller to update a sample
const updateBiobankSample = (req, res) => {
  const { id } = req.params;
  const sampleData = req.body;
  const file = req.file;

  // Attach file buffer to the sampleData
  sampleData.logo = file?.buffer;
  if (sampleData.DateOfCollection) {
    sampleData.DateOfCollection = moment(sampleData.DateOfCollection).format('YYYY-MM-DD');
  }

  BioBankModel.updateBiobankSample(id, sampleData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating sample" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
    res.status(200).json({ message: "Sample updated successfully" });
  });
};

const UpdateSampleStatus = (req, res) => {
  const sampleId = req.params.id;
  const { sample_status } = req.body;

  BioBankModel.UpdateSampleStatus(sampleId, sample_status, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update sample status.' });

    res.status(200).json(result);
  });
};
module.exports = {
  getBiobankSamples,
  createBiobankSample,
  updateBiobankSample,
  getQuarantineStock,
  UpdateSampleStatus
  
};
