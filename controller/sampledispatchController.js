const mysqlConnection = require("../config/db");
const sampleDispatchModel = require('../models/sampledispatchModel');

// Controller for creating the sample dispatch table
const createSampleDispatchTable = (req, res) => {
  sampleDispatchModel.createSampleDispatchTable();
  res.status(200).json({ message: "Sample dispatch table creation process started" });
};

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
INNER JOIN sample s ON sd.sampleID = s.id
WHERE sd.TransferTo = ? AND sd.status = 'In Transit'
GROUP BY 
    s.id, sd.TransferTo, sd.status
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
    const { id } = req.params; // Sample ID
    console.log("Sample Dispatch id is:", id);
  
    const { TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity } = req.body;
  
    if (!TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber || !Quantity) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
  
    const parsedQuantity = parseInt(Quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a valid positive number' });
    }
  
    // Get TransferFrom, current quantity, and sample status
    const getTransferFromQuery = `
      SELECT user_account_id, Quantity AS currentQuantity, status 
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
      let currentQuantity = parseInt(results[0].currentQuantity, 10);
      let sampleStatus = results[0].status;
  
      if (currentQuantity < parsedQuantity) {
        return res.status(400).json({ error: 'Insufficient quantity available for dispatch' });
      }
  
      // Check if the sample is already dispatched to TransferTo
      const checkExistingDispatchQuery = `
        SELECT id, Quantity, status 
        FROM sampledispatch 
        WHERE sampleID = ? AND TransferFrom = ? AND TransferTo = ?
      `;
  
      mysqlConnection.query(checkExistingDispatchQuery, [id, TransferFrom, TransferTo], (checkErr, dispatchResults) => {
        if (checkErr) {
          console.error('Database error checking existing dispatch:', checkErr);
          return res.status(500).json({ error: 'Error checking existing dispatch' });
        }
  
        if (dispatchResults.length > 0) {
          const existingDispatch = dispatchResults[0];
          const newQuantity = parseInt(existingDispatch.Quantity, 10) + parsedQuantity;
  
          // **Case 1: If status is 'In Transit', update quantity**
          if (existingDispatch.status === 'In Transit') {
            const updateDispatchQuery = `
              UPDATE sampledispatch
              SET Quantity = ?
              WHERE id = ?
            `;
  
            mysqlConnection.query(updateDispatchQuery, [newQuantity, existingDispatch.id], (updateErr) => {
              if (updateErr) {
                console.error('Database error updating dispatch quantity:', updateErr);
                return res.status(500).json({ error: 'An error occurred while updating the dispatch quantity' });
              }
  
              // Deduct the dispatched quantity from sample table
              const updateSampleQuantityQuery = `
                UPDATE sample
                SET Quantity = Quantity - ?
                WHERE id = ?
              `;
  
              mysqlConnection.query(updateSampleQuantityQuery, [parsedQuantity, id], (updateSampleErr) => {
                if (updateSampleErr) {
                  console.error('Database error updating sample quantity:', updateSampleErr);
                  return res.status(500).json({ error: 'An error occurred while updating the sample quantity' });
                }
  
                res.status(200).json({ message: 'Sample quantity updated successfully' });
              });
            });
          } else {
            // **Case 2: If status is 'In Stock', insert a new dispatch record**
            sampleDispatchModel.createSampleDispatch(
              { TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity: parsedQuantity },
              id,
              (insertErr, result) => {
                if (insertErr) {
                  console.error('Database error during INSERT:', insertErr);
                  return res.status(500).json({ error: 'An error occurred while creating the dispatch' });
                }
  
                // Deduct dispatched quantity from sample table
                const updateQuantityQuery = `
                  UPDATE sample
                  SET Quantity = Quantity - ?
                  WHERE id = ?
                `;
  
                mysqlConnection.query(updateQuantityQuery, [parsedQuantity, id], (updateErr) => {
                  if (updateErr) {
                    console.error('Database error during quantity update:', updateErr);
                    return res.status(500).json({ error: 'An error occurred while updating the sample quantity' });
                  }
  
                  res.status(201).json({ message: 'Sample Dispatch created successfully', id: result.insertId });
                });
              }
            );
          }
        } else {
          // **Case 3: No existing dispatch, insert new dispatch**
          sampleDispatchModel.createSampleDispatch(
            { TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity: parsedQuantity },
            id,
            (insertErr, result) => {
              if (insertErr) {
                console.error('Database error during INSERT:', insertErr);
                return res.status(500).json({ error: 'An error occurred while creating the dispatch' });
              }
  
              // Deduct dispatched quantity from sample table
              const updateQuantityQuery = `
                UPDATE sample
                SET Quantity = Quantity - ?
                WHERE id = ?
              `;
  
              mysqlConnection.query(updateQuantityQuery, [parsedQuantity, id], (updateErr) => {
                if (updateErr) {
                  console.error('Database error during quantity update:', updateErr);
                  return res.status(500).json({ error: 'An error occurred while updating the sample quantity' });
                }
  
                res.status(201).json({ message: 'Sample Dispatch created successfully', id: result.insertId });
              });
            }
          );
        }
      });
    });
  };


module.exports = {
  createSampleDispatchTable,
  createSampleDispatch,
  getDispatchedwithInTransitStatus
};