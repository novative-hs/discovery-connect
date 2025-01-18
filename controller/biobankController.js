const BioBankModal = require('../models/biobankModal');

const moment = require('moment');



// Controller to get all BioBank
const getAllBioBank = (req, res) => {
  BioBankModal.getAllBioBank((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Bio Bank" });
    }
    res.status(200).json(results);
  });
};

// Controller to get a BioBank by ID
const getBioBankById = (req, res) => {
  const { id } = req.params;
  BioBankModal.getBioBankById(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Bio Bank" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Bio Bank not found" });
    }
    res.status(200).json(results[0]);
  });
};

// Controller to create a BioBank
const createBioBank = (req, res) => {
  const biobank = req.body;
  // Required fields validation
 const requiredFields = [
    'masterID', 'donorID', 'samplename', 'age', 'gender', 'ethnicity',
    'samplecondition', 'storagetemp', 'storagetempUnit', 'ContainerType',
    'CountryOfCollection', 'price', 'SamplePriceCurrency', 'quantity',
    'QuantityUnit', 'labname', 'SampleTypeMatrix', 'TypeMatrixSubtype',
    'ProcurementType', 'endTime', 'SmokingStatus', 'TestMethod',
    'TestResult', 'TestResultUnit', 'InfectiousDiseaseTesting', 'InfectiousDiseaseResult',
    'CutOffRange', 'CutOffRangeUnit', 'FreezeThawCycles', 'DateOfCollection',
    'ConcurrentMedicalConditions', 'ConcurrentMedications', 'AlcoholOrDrugAbuse',
    'DiagnosisTestParameter', 'ResultRemarks', 'TestKit', 'TestKitManufacturer',
    'TestSystem', 'TestSystemManufacturer','user_account_id'
];

  for (const field of requiredFields) {
    if (!biobank[field]) {
      return res.status(400).json({ error: `Field "${field}" is required` });
    }
  }

  BioBankModal.createBioBank(biobank, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error creating Bio Bank" });
    }
    res.status(201).json({ message: "Bio Bank created successfully", id: result.insertId });
  });
};

// Controller to update a BioBank
const updateBioBank = (req, res) => {
  const { id } = req.params;
  const biobankData = req.body;

  // Format endTime if provided
  if (biobankData.endTime) {
    biobankData.endTime = moment(biobankData.endTime).format('YYYY-MM-DD HH:mm:ss');
  
  }
  if (biobankData.DateOfCollection) {
    biobankData.DateOfCollection = moment(biobankData.DateOfCollection).format('YYYY-MM-DD');
  }

  BioBankModal.updateBioBank(id, biobankData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating Bio Bank" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Bio Bank not found" });
    }
    res.status(200).json({ message: "Bio Bank updated successfully" });
  });
};

// Controller to delete a BioBank
const deleteBioBank = (req, res) => {
  const { id } = req.params;

  BioBankModal.deleteBioBank(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Bio Bank" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Bio Bank not found" });
    }
    res.status(200).json({ message: "Bio Bank deleted successfully" });
  });
};

module.exports = {
  getAllBioBank,
  getBioBankById,
  createBioBank,
  updateBioBank,
  deleteBioBank,
};
