const mysqlConnection = require("../config/db");
const sampleDispatchModel = require('../models/sampledispatchModel');

// Controller for creating the sample dispatch table
const createSampleDispatchTable = (req, res) => {
  sampleDispatchModel.createSampleDispatchTable();
  res.status(200).json({ message: "Sample dispatch table creation process started" });
};

// Controller to get all sample dispatches in "In Transit" status
const getSampleDispatchesInTransit = (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }
  const query = `
    SELECT s.*
    FROM sampledispatch sd
    JOIN sample s ON sd.sampleID = s.id
    WHERE sd.TransferTo = ? AND s.status = "In Transit";
  `;
  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching sample dispatches:", err);
      return res.status(500).json({ error: "Error fetching sample dispatches" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a new sample dispatch
const createSampleDispatch = (req, res) => {
  const { id } = req.params; // ID of the sample being dispatched
  console.log("sample dispatch id is:", id);
  const { TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber } = req.body;

  // Validate input data
  if (!TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Retrieve `TransferFrom` dynamically (e.g., from the logged-in user's account)
  const getTransferFromQuery = `
    SELECT user_account_id 
    FROM sample 
    WHERE id = ?
  `;

  mysqlConnection.query(getTransferFromQuery, [id], (err, results) => {
    if (err) {
      console.error('Database error fetching TransferFrom:', err);
      return res.status(500).json({ error: 'Error fetching TransferFrom' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    const TransferFrom = results[0].user_account_id;

    // Create the sample dispatch record
    sampleDispatchModel.createSampleDispatch({ TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber }, id, (err, result) => {
      if (err) {
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
  });
};


module.exports = {
  createSampleDispatchTable,
  getSampleDispatchesInTransit,
  createSampleDispatch,
};