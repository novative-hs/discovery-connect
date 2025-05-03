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
  const page = req.query.page || 1; // Get page from query, default to 1
  const pageSize = req.query.pageSize || 50; // Get pageSize from query, default to 50
  const searchField = req.query.searchField || null;
  const searchValue = req.query.searchValue || null;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }
  
  SampleModel.getSamples(id, page, pageSize,searchField, searchValue, (err, results) => {
    if (err) {
      console.error('Error in model:', err);
      return res.status(500).json({ error: "Error fetching samples" });
    }
    const { results: samples, totalCount } = results;
    res.status(200).json({
      samples,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
      totalCount,
    });
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
const getResearcherSamples = (req, res) => {
  const { id } = req.params; // Get user ID from request parameters

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  SampleModel.getResearcherSamples(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching sample", details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "No samplesdddddd found" });
    }
    res.status(200).json(results);
  });
};


const getAllCSSamples = (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const offset = parseInt(req.query.offset) || 0;

  SampleModel.getAllCSSamples(limit, offset, (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching samples" });
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
  const file = req.file;

  // Attach file buffer to the sampleData
  sampleData.logo = file?.buffer;
  // Required fields validation
  const requiredFields = [
    'donorID', 'samplename', 'age', 'gender', 'ethnicity', 'samplecondition', 'storagetemp', 'ContainerType', 'CountryOfCollection', 'quantity', 'QuantityUnit', 'SampleTypeMatrix', 'SmokingStatus', 'AlcoholOrDrugAbuse', 'InfectiousDiseaseTesting', 'InfectiousDiseaseResult', 'FreezeThawCycles', 'DateOfCollection', 'ConcurrentMedicalConditions', 'ConcurrentMedications', 'DiagnosisTestParameter', 'TestResult', 'TestResultUnit', 'TestMethod', 'TestKitManufacturer', 'TestSystem', 'TestSystemManufacturer' , 'logo'
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

  

  SampleModel.createSample(sampleData, (err, result) => {
    if (err) {
      console.error('Error creating sample:', err);
      return res.status(500).json({ error: "Error creating sample" });
    }
    
    res.status(201).json({ message: "Sample created successfully", id: result.insertId });
  });
};

// Controller to update a sample
const updateSample = (req, res) => {
  const { id } = req.params;
  const sampleData = req.body;
  const file = req.file;

  // Attach file buffer to the sampleData
  sampleData.logo = file?.buffer;
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
const getFilteredSamples = (req, res) => {
  const { price, smokingStatus } = req.query;

  SampleModel.getFilteredSamples(price, smokingStatus, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database query failed", details: err });
    }
    res.status(200).json(results);
  });
};
module.exports = {
  createSampleTable,
  getFilteredSamples,
  getSamples,
  getAllSamples,
  getResearcherSamples,
  getAllCSSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
};