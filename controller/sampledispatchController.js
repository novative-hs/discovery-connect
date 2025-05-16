const mysqlConnection = require("../config/db");
const sampleDispatchModel = require('../models/sampledispatchModel');

// Controller for creating the sample dispatch table
const createSampleDispatchTable = (req, res) => {
  sampleDispatchModel.createSampleDispatchTable();
  res.status(200).json({ message: "Sample dispatch table creation process started" });
};

// Controller to get all sample dispatches in "In Transit" status
const getDispatchedwithInTransitStatus = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }

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
  s.ContainerType,
  s.CountryOfCollection,
  s.price,
  s.SamplePriceCurrency,
  s.QuantityUnit,
  s.SampleTypeMatrix,
  s.SmokingStatus,
  s.AlcoholOrDrugAbuse,
  s.InfectiousDiseaseTesting,
  s.InfectiousDiseaseResult,
  s.FreezeThawCycles,
  s.DateOfCollection,
  s.ConcurrentMedicalConditions,
  s.ConcurrentMedications,
  s.DiagnosisTestParameter,
  s.TestResult,
  s.TestResultUnit,
  s.TestMethod,
  s.TestKitManufacturer,
  s.TestSystem,
  s.TestSystemManufacturer,
  s.user_account_id,
  sd.TransferTo,
  SUM(sd.Quantity) AS Quantity,
  sd.status
FROM sampledispatch sd
JOIN sample s ON sd.sampleID = s.id
JOIN user_account ua_transfer ON sd.TransferTo = ua_transfer.id
JOIN collectionsite cs ON ua_transfer.id = cs.user_account_id
JOIN collectionsitestaff cs_loggedin ON cs_loggedin.collectionsite_id = cs.id
WHERE cs_loggedin.user_account_id = ?
  AND sd.status = 'In Transit'
GROUP BY s.id, sd.TransferTo, sd.status;

  `;

  mysqlConnection.query(query, [userId], (err, results) => {
    
    if (err) {
      console.error("Database error fetching samples:", err.message);
      return res.status(500).json({ error: "An error occurred while fetching samples" });
    }

    res.status(200).json({ data: results });
  });
};



// Controller to create a new sample dispatch
const createSampleDispatch = (req, res) => {
  const { id } = req.params; // sampleID
  const {
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity,
  } = req.body;

  if (!TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber || !Quantity) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const parsedQuantity = parseInt(Quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a valid positive number' });
  }

  // Step 1: Get sample details, especially TransferFrom and current quantity
  const getSampleQuery = `
    SELECT user_account_id AS TransferFrom, Quantity AS currentQuantity
    FROM sample
    WHERE id = ?
  `;

  mysqlConnection.query(getSampleQuery, [id], (err, results) => {
    if (err) {
      console.error('Database error fetching sample:', err);
      return res.status(500).json({ error: 'Database error fetching sample' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    const TransferFrom = results[0].TransferFrom;
    const currentQuantity = parseInt(results[0].currentQuantity, 10);

    // Step 2: Get collectionsite_id for both users
    const getSitesQuery = `
      SELECT user_account_id, id AS collectionsite_id
      FROM collectionsite
      WHERE user_account_id IN (?, ?)
    `;

    mysqlConnection.query(getSitesQuery, [TransferFrom, TransferTo], (siteErr, siteResults) => {
      if (siteErr) {
        console.error('Error fetching collection site IDs:', siteErr);
        return res.status(500).json({ error: 'Error fetching collection site IDs' });
      }

      // Find sites for each user
      const fromSite = siteResults.find(u => u.user_account_id === TransferFrom)?.collectionsite_id;
      const toSite = siteResults.find(u => u.user_account_id === TransferTo)?.collectionsite_id;

      // Determine if this is a return dispatch: both sites exist and are the same
      const isReturn = fromSite && toSite && fromSite === toSite;

      function createForwardDispatch() {
        if (currentQuantity < parsedQuantity) {
          return res.status(400).json({ error: 'Insufficient quantity for dispatch' });
        }

        const dispatchData = {
          TransferFrom,
          TransferTo,
          dispatchVia,
          dispatcherName,
          dispatchReceiptNumber,
          Quantity: parsedQuantity,
          status: 'In Transit'
        };

        sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {
          if (insertErr) {
            console.error('Failed to insert dispatch record:', insertErr);
            return res.status(500).json({ error: 'Failed to insert dispatch record' });
          }

          const updateSample = `UPDATE sample SET Quantity = Quantity - ? WHERE id = ?`;
          mysqlConnection.query(updateSample, [parsedQuantity, id], (updateErr) => {
            if (updateErr) {
              console.error('Sample quantity update failed:', updateErr);
              return res.status(500).json({ error: 'Sample quantity update failed' });
            }

            return res.status(201).json({ message: 'Dispatch created successfully', id: result.insertId });
          });
        });
      }

      function createReturnDispatch() {
        const dispatchData = {
          TransferFrom,
          TransferTo,
          dispatchVia,
          dispatcherName,
          dispatchReceiptNumber,
          Quantity: parsedQuantity,
          status: 'Return'
        };

        sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {
          if (insertErr) {
            console.error('Failed to insert return dispatch record:', insertErr);
            return res.status(500).json({ error: 'Failed to insert return dispatch record' });
          }

          // Do NOT update sample quantity on return

          return res.status(201).json({ message: 'Return dispatch created successfully', id: result.insertId });
        });
      }

      // If either user has no collection site, treat as forward dispatch
      if (!fromSite || !toSite) {
        return createForwardDispatch();
      }

      if (!isReturn) {
        createForwardDispatch();
      } else {
        createReturnDispatch();
      }
    });
  });
};









module.exports = {
  createSampleDispatchTable,
  createSampleDispatch,
  getDispatchedwithInTransitStatus
};