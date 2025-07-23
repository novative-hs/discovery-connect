const SampleModel = require('../models/sampleModel');

const moment = require('moment');

// Controller for creating the sample table
const createSampleTable = (req, res) => {
  SampleModel.createSampleTable();

  res.status(200).json({ message: "Sample table creation process started" });
};

const getAllSampleinIndex = (req, res) => {
  const { name } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const searchField = req.query.field;
  const searchValue = req.query.value;

  console.log("Data:", name, page, limit, searchField, searchValue);

  SampleModel.getAllSampleinIndex(name, limit, offset, searchField, searchValue, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching samples detail" });
    }

    res.status(200).json({
      data: results.data,
      total: results.total,
    });
  });
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

  SampleModel.getSamples(id, page, pageSize, searchField, searchValue, (err, results) => {
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

const getAllVolumnUnits = (req, res) => {
  const { name } = req.params;

  SampleModel.getAllVolumnUnits(name, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching samples volumn" });
    }
    res.status(200).json({ data: results });
  });
}
const deleteSample = (req, res) => {
  const sampleId = req.params.id;

  SampleModel.deleteSample(sampleId, (err, result) => {
    if (err) {
      console.error("Error deleting sample:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Sample not found" });
    }

    res.status(200).json({ success: true, message: "Sample deleted successfully" });
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

const updateReservedSample = (req, res) => {
  const sampleId = req.params.id;
  const status=req.params.status

  SampleModel.updateReservedSample(sampleId,status, (err, result) => {
    if (err) {
      console.error("Error updating sample:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Sample not found" });
    }

    return res.status(200).json({ success: true, message: "Sample reserved successfully" });
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
const getsingleSamples = (req, res) => {
  const { sampleId } = req.params;

  SampleModel.getsingleSamples(sampleId, (err, sample) => {
    if (err) {
      console.error("❌ Error in fetching sample:", err);
      return res.status(500).json({ error: "Error fetching sample" });
    }

    if (!sample) {
      return res.status(404).json({ error: "Sample not found" });
    }

    res.status(200).json(sample);
  });
};


const getPoolSampleDetails = (req, res) => {
  const { id } = req.params;
  SampleModel.getPoolSampleDetails(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching sample" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
    res.status(200).json(results);
  })
}

// Controller to create a sample
const createSample = (req, res) => {

  const mode = req.body.mode;
  const files = req.files;

  const sampleData = { ...req.body }; // copy all fields from body
  sampleData.logo = files?.logo?.[0]?.buffer || null;
  sampleData.samplepdf = files?.samplepdf?.[0]?.buffer || null;
  sampleData.mode = mode;

  // DateOfSampling will show data only before today
  const today = new Date();
  const DateOfSampling = new Date(sampleData.DateOfSampling);

  if (DateOfSampling >= today) {
    return res.status(400).json({ error: "DateOfSampling must be before today" });
  }
  SampleModel.createSample(sampleData, (err, result) => {
    if (err) {
      console.error("Error creating sample:", err);

      if (
        err.message === "Duplicate entry: This patient sample already exists."
      ) {
        return res.status(409).json({ error: err.message }); // <-- 409 Conflict
      }

      return res.status(500).json({ error: "Error creating sample" });
    }

    res.status(201).json({
      message: "Sample created successfully",
      id: result.insertId,
    });
  });

};

// Controller to update a sample
const updateSample = (req, res) => {
  const { id } = req.params;
  const sampleData = req.body;
  const files = req.files;
  const logoFile = files?.logo?.[0];
  const samplePdfFile = files?.samplepdf?.[0];

  // Attach file buffer to the sampleData
  if (logoFile) {
    sampleData.logo = logoFile.buffer;
  }
  if (samplePdfFile) {
    sampleData.samplepdf = samplePdfFile.buffer;
  }
  if (sampleData.DateOfSampling) {
    sampleData.DateOfSampling = moment(sampleData.DateOfSampling).format('YYYY-MM-DD');
  }

  SampleModel.updateSample(id, sampleData, files, (err, result) => {
    if (err) {
      console.error('Error updating sample:', err);
      return res.status(500).json({ error: "Error updating sample" });
    }

    // Check if result is not undefined and contains affectedRows
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }

    res.status(200).json({ message: "Sample updated successfully" });
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

const updateQuarantineSamples = (req, res) => {
  const sampleId = req.params.id;
  const { status, comment } = req.body;

  if (!status || !comment) {
    return res.status(400).json({ error: 'Both status and comment are required' });
  }

  SampleModel.updateQuarantineSamples(sampleId, status, comment, (err, result) => {
    if (err) {
      console.error("Error in updating Sample status:", err);
      return res.status(500).json({ error: 'Error in updating Sample status' });
    }

    return res.status(200).json({ message: 'Sample status updated and comment saved successfully' });
  });
};

const updatetestResultandUnit = (req, res) => {

  const { id } = req.params;
  const data = req.body;
  data.samplepdf = req.body?.samplepdf?.[0]?.buffer || null;

  SampleModel.updatetestResultandUnit(id, data, (err, result) => {
    if (err) {
      console.error("Error in updating Test Result and Unit:", err);
      return res.status(500).json({ error: 'Error in updating Sample status' });
    }

    return res.status(200).json({ message: 'Sample mode status updated' });

  })
}
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
  updateQuarantineSamples,
  deleteSample,
  getAllVolumnUnits,
  getAllSampleinIndex,
  getPoolSampleDetails,
  updatetestResultandUnit,
  getsingleSamples,
  updateReservedSample
};