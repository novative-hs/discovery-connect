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
    TransferFrom,
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity,
    isReturn = false,
  } = req.body;

  if (!TransferFrom || !TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber || !Quantity) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const parsedQuantity = parseInt(Quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a valid positive number' });
  }

  const getSampleQuery = `SELECT Quantity AS currentQuantity FROM sample WHERE id = ?`;

  mysqlConnection.query(getSampleQuery, [id], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching sample:', err);
      return res.status(500).json({ error: 'Database error fetching sample' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Sample not found' });
    }

    const currentQuantity = parseInt(results[0].currentQuantity, 10);

    const getUserAccountIdQuery = `
      SELECT cs.user_account_id
      FROM discoveryconnect.collectionsitestaff cstaff
      JOIN collectionsite cs ON cstaff.collectionsite_id = cs.id
      WHERE cstaff.user_account_id = ?
    `;

    mysqlConnection.query(getUserAccountIdQuery, [TransferFrom], (userErr, userResults) => {
      if (userErr) {
        console.error('❌ Failed to fetch user_account_id:', userErr);
        return res.status(500).json({ error: 'Database error fetching user account ID' });
      }

      if (userResults.length === 0) {
        return res.status(404).json({ error: 'Collection site user not found for this TransferFrom ID' });
      }

      const userAccountId = userResults[0].user_account_id;
console.log(TransferFrom,TransferTo)
      // Count past dispatches (TransferTo -> TransferFrom)
      const getDispatchCountQuery = `
        SELECT COUNT(*) AS dispatchCount
        FROM sampledispatch
        WHERE sampleID = ? AND TransferFrom = ? AND TransferTo = ?
      `;

      // Count past returns (TransferFrom -> TransferTo)
      const getReturnCountQuery = `
        SELECT COUNT(*) AS returnCount
        FROM samplereturn
        WHERE sampleID = ?  AND TransferTo = ?
      `;
      
      mysqlConnection.query(getDispatchCountQuery, [id, TransferTo, userAccountId], (dispatchErr, dispatchResults) => {
        if (dispatchErr) {
          console.error('❌ Error checking dispatch count:', dispatchErr);
          return res.status(500).json({ error: 'Error checking dispatch count' });
        }

        mysqlConnection.query(getReturnCountQuery, [id, TransferTo], (returnErr, returnResults) => {
          if (returnErr) {
            console.error('❌ Error checking return count:', returnErr);
            return res.status(500).json({ error: 'Error checking return count' });
          }

          const dispatchCount = dispatchResults[0].dispatchCount;
          const returnCount = returnResults[0].returnCount;

          const dispatchData = {
            TransferFrom: userAccountId,
            TransferTo,
            dispatchVia,
            dispatcherName,
            dispatchReceiptNumber,
            Quantity: parsedQuantity,
            status: 'In Transit'
          };

          if (dispatchCount > returnCount) {
            // ✅ This is a return + forward dispatch (no quantity deduction)

            const insertReturnQuery = `
              INSERT INTO samplereturn (
                TransferFrom,
                TransferTo,
                dispatchVia,
                dispatcherName,
                dispatchReceiptNumber,
                Quantity,
                sampleID
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            mysqlConnection.query(
              insertReturnQuery,
              [TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, parsedQuantity, id],
              (returnErr, returnResult) => {
                if (returnErr) {
                  console.error('❌ Failed to insert samplereturn record:', returnErr);
                  return res.status(500).json({ error: 'Failed to insert return record' });
                }

                sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {
                  if (insertErr) {
                    console.error('❌ Failed to insert dispatch record:', insertErr);
                    return res.status(500).json({ error: 'Failed to insert dispatch record' });
                  }

                  console.log('✅ Return + Dispatch recorded, no quantity reduced.');
                  return res.status(201).json({
                    message: 'Return and Forward dispatch recorded',
                    dispatchId: result.insertId,
                    returnId: returnResult.insertId
                  });
                });
              }
            );
          } else {
            // ✅ This is a new dispatch (with quantity deduction)

            if (currentQuantity < parsedQuantity) {
              return res.status(400).json({ error: 'Insufficient quantity for dispatch' });
            }

            sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {
              if (insertErr) {
                console.error('❌ Failed to insert dispatch record:', insertErr);
                return res.status(500).json({ error: 'Failed to insert dispatch record' });
              }

              const updateSample = `UPDATE sample SET Quantity = Quantity - ? WHERE id = ?`;
              mysqlConnection.query(updateSample, [parsedQuantity, id], (updateErr) => {
                if (updateErr) {
                  console.error('❌ Sample quantity update failed:', updateErr);
                  return res.status(500).json({ error: 'Sample quantity update failed' });
                }

                console.log('✅ New Dispatch created & Quantity updated in `sample` table.');
                return res.status(201).json({
                  message: 'New dispatch created and quantity updated',
                  dispatchId: result.insertId
                });
              });
            });
          }
        });
      });
    });
  });
};






module.exports = {
  createSampleDispatchTable,
  createSampleDispatch,
  getDispatchedwithInTransitStatus
};