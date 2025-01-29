const mysqlConnection = require("../config/db");
const sampleDispatchModel = require('../models/sampledispatchModel');

// Controller for creating the sample dispatch table
const createSampleDispatchTable = (req, res) => {
  sampleDispatchModel.createSampleDispatchTable();
  res.status(200).json({ message: "Sample dispatch table creation process started" });
};

// Controller to get all sample dispatches in "In Transit" status
// const getSampleDispatchesInTransit = (req, res) => {
//   const id = req.params.id;

//   if (!id) {
//     return res.status(400).json({ error: "ID parameter is missing" });
//   }
//   const query = `
//     SELECT s.*
//     FROM sampledispatch sd
//     JOIN sample s ON sd.sampleID = s.id
//     WHERE sd.TransferTo = ? AND s.status = "In Transit";
//   `;
//   mysqlConnection.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("Error fetching sample dispatches:", err);
//       return res.status(500).json({ error: "Error fetching sample dispatches" });
//     }
//     res.status(200).json(results);
//   });
// };

// Controller to get all sample dispatches in "In Transit" status
const getDispatchedwithInTransitStatus = (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }

  // SQL query to fetch samples where the logged-in user is the recipient (TransferTo)
  const query = `
    SELECT 
      s.id,
      s.masterID,
      s.donorID,
      s.samplename,
      s.age,
      s.gender,
      s.ethnicity,
      s.samplecondition,
      s.storagetemp,
      s.storagetempUnit,
      s.ContainerType,
      s.CountryOfCollection,
      s.price,
      s.SamplePriceCurrency,
      s.QuantityUnit,
      s.labname,
      s.SampleTypeMatrix,
      s.TypeMatrixSubtype,
      s.ProcurementType,
      s.SmokingStatus,
      s.TestMethod,
      s.TestResult,
      s.TestResultUnit,
      s.InfectiousDiseaseTesting,
      s.InfectiousDiseaseResult,
      s.CutOffRange,
      s.CutOffRangeUnit,
      s.FreezeThawCycles,
      s.DateOfCollection,
      s.ConcurrentMedicalConditions,
      s.ConcurrentMedications,
      s.AlcoholOrDrugAbuse,
      s.DiagnosisTestParameter,
      s.ResultRemarks,
      s.TestKit,
      s.TestKitManufacturer,
      s.TestSystem,
      s.TestSystemManufacturer,
      s.endTime,
      s.user_account_id AS TransferFrom,
      sd.TransferTo,
      sd.Quantity AS Quantity,
      sd.status AS status
    FROM sampledispatch sd
    INNER JOIN sample s ON sd.sampleID = s.id
    WHERE sd.TransferTo = ? AND sd.status = 'In Transit'
  `;

  // Execute the query using the logged-in user's `user_account_id`
  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error fetching samples:", err.message);
      return res.status(500).json({ error: "An error occurred while fetching samples" });
    }

    res.status(200).json({ data: results });
  });
};


// Controller to create a new sample dispatch
const createSampleDispatch = (req, res) => {
  const { id } = req.params; // ID of the sample being dispatched
  console.log("Sample Dispatch id is:", id);
  const { TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity } = req.body;

  // Validate input data
  if (!TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber || !Quantity) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Retrieve `TransferFrom` dynamically (e.g., from the logged-in user's account)
  const getTransferFromQuery = `
    SELECT user_account_id, Quantity AS currentQuantity
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
    const currentQuantity = results[0].currentQuantity;

    // Check if there is enough quantity in the sample to dispatch
    if (currentQuantity < Quantity) {
      return res.status(400).json({ error: 'Insufficient quantity available for dispatch' });
    }

    // Deduct the dispatched quantity from the sample
    const updateQuantityQuery = `
      UPDATE sample
      SET quantity = Quantity - ?
      WHERE id = ?
    `;

    mysqlConnection.query(updateQuantityQuery, [Quantity, id], (updateErr) => {
      if (updateErr) {
        console.error('Database error during quantity update:', updateErr);
        return res.status(500).json({ error: 'An error occurred while updating the sample quantity' });
      }

      // Create the sample dispatch record
      sampleDispatchModel.createSampleDispatch({ TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity }, id, (err, result) => {
        if (err) {
          console.error('Database error during INSERT:', err);
          return res.status(500).json({ error: 'An error occurred while creating the dispatch' });
        }

        // Determine the sample's new status based on the remaining quantity
        const newStatus = currentQuantity - Quantity > 0 ? 'In Stock' : 'In Transit';

        // Update the sample's status
        const updateStatusQuery = `
          UPDATE sample
          SET status = ?
          WHERE id = ?
        `;

        mysqlConnection.query(updateStatusQuery, [newStatus, id], (updateStatusErr) => {
          if (updateStatusErr) {
            console.error('Database error during status update:', updateStatusErr);
            return res.status(500).json({ error: 'An error occurred while updating the sample status' });
          }

          res.status(201).json({ message: 'Sample Dispatch created successfully', id: result.insertId });
        });
      });
    });
  });
};




module.exports = {
  createSampleDispatchTable,
  // getSampleDispatchesInTransit,
  createSampleDispatch,
  getDispatchedwithInTransitStatus
};