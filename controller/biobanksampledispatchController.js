const mysqlConnection = require("../config/db");
const sampleDispatchModel = require('../models/biobanksampledispatchModel');

// Controller to get all sample dispatches in "In Transit" status
const getSampleDispatchesInTransit = (req, res) => {
    sampleDispatchModel.getSampleDispatchesInTransit((err, results) => {
      if (err) {
        console.error('Error fetching sample dispatches:', err); // Add more detailed logs here
        return res.status(500).json({ error: "Error fetching sample dispatches" });
      }
      res.status(200).json(results);
    });
  };
  const getSampleDispatchesDetail = (req, res) => {
    
    sampleDispatchModel.getSampleDispatchesDetail((err, results) => {
      if (err) {
        console.error('Error fetching sample dispatches:', err); // Add more detailed logs here
        return res.status(500).json({ error: "Error fetching sample dispatches" });
      }
      res.status(200).json(results);
    });
  };

// Controller to create a new sample dispatch
const createSampleDispatch = (req, res) => {
  const { id } = req.params; // ID of the sample being dispatched
  const { dispatchVia, dispatcherName, dispatchReceiptNumber,biobankid } = req.body;
  console.log( dispatchVia, dispatcherName, dispatchReceiptNumber,biobankid )
  // Validate input data
  if (!dispatchVia || !dispatcherName || !dispatchReceiptNumber) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Create the sample dispatch record
  sampleDispatchModel.createSampleDispatch({ dispatchVia, dispatcherName, dispatchReceiptNumber,biobankid }, id, (err, result) => {
    if (err) {
      console.log(dispatchVia, dispatcherName, dispatchReceiptNumber )
      console.error('Database error during INSERT:', err);
      return res.status(500).json({ error: 'An error occurred while creating the dispatch' });
    }

    // Update the sample's status to "In Transit"
    const updateQuery = `
      UPDATE sample
      SET status = 'In Transit'
      WHERE id = ?
    `;

    mysqlConnection.query(updateQuery, [id], (updateErr) => {
      if (updateErr) {
        console.error('Database error during UPDATE:', updateErr);
        return res.status(500).json({ error: 'An error occurred while updating the sample status' });
      }

      res.status(201).json({ message: 'Sample Dispatch created successfully', id: result.insertId });
    });
  });
};

module.exports = {
  
  getSampleDispatchesInTransit,
  getSampleDispatchesDetail,
  createSampleDispatch,
};
