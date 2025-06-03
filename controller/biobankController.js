const BioBankModel = require('../models/biobankModel');
const moment = require('moment');

const create_biobankTable = (req, res) => {
  BioBankModel.create_biobankTable();
  res.status(200).json({ message: "bio bank table creation process started" });
};

// Controller to create a sample
const getBiobankSamples = (req, res) => {
  const id = parseInt(req.params.id);
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 10;

  const priceFilter = req.query.priceFilter || null;
  const searchField = req.query.searchField || null;
  const searchValue = req.query.searchValue || null;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user_account_id" });
  }

  BioBankModel.getBiobankSamples(id, page, pageSize, priceFilter, searchField, searchValue, (err, results) => {
    if (err) {
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

const getQuarantineStock = (req, res) => {
  BioBankModel.getQuarantineStock((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching Quarantine Stock" });
    }
    res.status(200).json(results);
  });
};

// Controller to get samples with price > 0 in sample visibility page
const getBiobankVisibilitySamples = (req, res) => {
  const id = parseInt(req.params.id);
  const page = req.query.page || 1;
  const pageSize = req.query.pageSize || 10;

  const searchField = req.query.searchField || null;
  const searchValue = req.query.searchValue || null;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user_account_id" });
  }

  BioBankModel.getBiobankVisibilitySamples(id, page, pageSize, searchField, searchValue, (err, results) => {
    if (err) {
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

// Controller to create a sample
const createBiobankSample = (req, res) => {
  const sampleData = req.body;
  const file = req.file;

  // Attach file buffer to the sampleData
  sampleData.logo = file?.buffer;

  const today = new Date();
  const dateOfSampling = new Date(sampleData.DateOfSampling);

  if (dateOfSampling >= today) {
    return res.status(400).json({ error: "DateOfSampling must be before today" });
  }


  BioBankModel.createBiobankSample(sampleData, (err, result) => {
    if (err) {
      console.error('Error creating sample:', err);
      return res.status(500).json({ error: "Error creating sample" });
    }
    res.status(201).json({ message: "Sample created successfully", id: result.insertId });
  });
};

// Controller to add price and price currency of a sample
const postSamplePrice = (req, res) => {
  const sampleData = req.body;

  BioBankModel.postSamplePrice(sampleData, (err, result) => {
    if (err) {
      console.error('Error adding price of a sample:', err);
      return res.status(500).json({ error: "Error adding price of a sample" });
    }

    res.status(201).json({ message: "Sample price added successfully", id: result.insertId });
  });
};

// Controller to update a sample
const updateBiobankSample = (req, res) => {
  const { id } = req.params;
  const sampleData = req.body;
  const file = req.file;

  // Check if a new logo is uploaded, otherwise retain the current logo
  if (file) {
    sampleData.logo = req.file.buffer;
  }
  else if (sampleData.logo?.data) {
    // Reconvert from serialized buffer object
    sampleData.logo = Buffer.from(sampleData.logo.data);
  }
  // Handle Date format
  if (sampleData.DateOfSampling) {
    sampleData.DateOfSampling = moment(sampleData.DateOfSampling).format('YYYY-MM-DD');
  }

  // Handle logo (priority: uploaded file > body)

  // Call model
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
  const { sample_visibility } = req.body;

  BioBankModel.UpdateSampleStatus(sampleId, sample_visibility, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update sample status.' });

    res.status(200).json(result);
  });
};

// Controller to get prices dropdown in BB dashboard of that specific sample
const getPrice = (req, res) => {
  const { name } = req.params;

  BioBankModel.getPrice(name, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching samples price" });
    }
    res.status(200).json({ data: results });
  });
};

module.exports = {
  create_biobankTable,
  getBiobankSamples,
  postSamplePrice,
  createBiobankSample,
  updateBiobankSample,
  getQuarantineStock,
  getBiobankVisibilitySamples,
  UpdateSampleStatus,
  getPrice

};
