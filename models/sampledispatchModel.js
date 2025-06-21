const mysqlConnection = require("../config/db");

const createSampleDispatchTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sampledispatch (
      id INT AUTO_INCREMENT PRIMARY KEY,
      TransferTo INT NOT NULL,
      TransferFrom INT NOT NULL,
      dispatchVia VARCHAR(255) NOT NULL,
      dispatcherName VARCHAR(255) NOT NULL,
      dispatchReceiptNumber VARCHAR(255) NOT NULL,
      Quantity VARCHAR(255) NOT NULL,
      Reason VARCHAR(255) NULL,
      status VARCHAR(255) DEFAULT 'In Transit',
      TransferDate DATE DEFAULT (CURRENT_DATE),
      sampleID VARCHAR(36) NOT NULL,
      FOREIGN KEY (sampleID) REFERENCES sample(id),
      FOREIGN KEY (TransferTo) REFERENCES collectionsite(id) ON DELETE CASCADE,
      FOREIGN KEY (TransferFrom) REFERENCES user_account(id) ON DELETE CASCADE
    )
  `;

  mysqlConnection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating sample dispatch table:", err);
    } else {
      console.log("Sample dispatch table created or already exists.");
    }
  });
};

// Function to fetch dispatched samples with 'In Transit' status
const getDispatchedwithInTransitStatus = (userId, callback) => {
  const query = `
    SELECT 
      s.id,
      s.masterID,
      s.MRNumber,
      s.Analyte,
      s.age,
      s.gender,
      s.ethnicity,
      s.samplecondition,
      s.storagetemp,
      s.ContainerType,
      s.volume,
      s.CountryOfCollection,
      s.price,
      s.SamplePriceCurrency,
      s.VolumeUnit,
      s.SampleTypeMatrix,
      s.SmokingStatus,
      s.AlcoholOrDrugAbuse,
      s.InfectiousDiseaseTesting,
      s.InfectiousDiseaseResult,
      s.FreezeThawCycles,
      s.DateOfSampling,
      s.ConcurrentMedicalConditions,
      s.ConcurrentMedications,
      s.TestResult,
      s.TestResultUnit,
      s.TestMethod,
      s.TestKitManufacturer,
      s.TestSystem,
      s.TestSystemManufacturer,
      s.user_account_id,
      sd.id as Dispatch_id,
      sd.TransferTo,
      sd.dispatchVia,
      sd.dispatcherName,
      sd.dispatchReceiptNumber,
      sd.TransferDate,
      sd.Quantity,
      sd.status,
      s.sample_visibility
    FROM sampledispatch sd
    JOIN sample s ON sd.sampleID = s.id
    JOIN collectionsitestaff cs_staff ON cs_staff.user_account_id = ?
    WHERE sd.TransferTo = cs_staff.collectionsite_id
      AND sd.status = 'In Transit';
  `;

  mysqlConnection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error fetching dispatched samples:", err.message);
      return callback(err);
    }
    return callback(null, results);
  });
};
const getSampleLost = (userId, page, pageSize, searchField, searchValue, callback) => {
  const offset = (page - 1) * pageSize;
  const searchClause = searchField && searchValue ? ` AND s.${searchField} LIKE ?` : '';
  const searchParam = searchField && searchValue ? [`%${searchValue}%`] : [];

  // Step 1: Get collectionsite_id for the user
  const siteQuery = `SELECT collectionsite_id FROM collectionsitestaff WHERE user_account_id = ?`;

  mysqlConnection.query(siteQuery, [userId], (siteErr, siteResults) => {
    if (siteErr) {
      console.error("Error fetching collectionsite_id:", siteErr.message);
      return callback(siteErr);
    }

    if (siteResults.length === 0) {
      return callback(null, { samples: [], totalCount: 0 }); // No site found
    }

    const collectionsiteId = siteResults[0].collectionsite_id;

    // Step 2: Get all user_account_ids from the same collection site
    const staffQuery = `SELECT user_account_id FROM collectionsitestaff WHERE collectionsite_id = ?`;

    mysqlConnection.query(staffQuery, [collectionsiteId], (staffErr, staffResults) => {
      if (staffErr) {
        console.error("Error fetching staff user_account_ids:", staffErr.message);
        return callback(staffErr);
      }

      if (staffResults.length === 0) {
        return callback(null, { samples: [], totalCount: 0 }); // No staff at site
      }

      const staffUserIds = staffResults.map(row => row.user_account_id);

      // Step 3: Build IN clause placeholders for dynamic user IDs
      const inClause = staffUserIds.map(() => '?').join(',');

      // Step 4: Final data query to get lost samples sent FROM these staff
      const dataQuery = `
        SELECT 
          s.*,
          sd.id AS Dispatch_id,
          sd.TransferTo,
          sd.TransferFrom,
          sd.dispatchVia,
          sd.dispatcherName,
          sd.dispatchReceiptNumber,
          sd.TransferDate,
          sd.Quantity,
          sd.status,
          sd.Reason,
          sender.staffName AS senderStaffName
        FROM sampledispatch sd
        JOIN sample s ON sd.sampleID = s.id
        LEFT JOIN collectionsitestaff sender ON sender.user_account_id = sd.TransferFrom
        WHERE sd.TransferFrom IN (${inClause})
          AND sd.status = 'Lost'
          ${searchClause}
        LIMIT ? OFFSET ?;
      `;

      const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM sampledispatch sd
        JOIN sample s ON sd.sampleID = s.id
        WHERE sd.TransferFrom IN (${inClause})
          AND sd.status = 'Lost'
          ${searchClause};
      `;

      const dataParams = [...staffUserIds, ...searchParam, parseInt(pageSize), parseInt(offset)];
      const countParams = [...staffUserIds, ...searchParam];

      mysqlConnection.query(dataQuery, dataParams, (err, results) => {
        if (err) {
          console.error("Error fetching lost samples:", err.message);
          return callback(err);
        }

        mysqlConnection.query(countQuery, countParams, (countErr, countResults) => {
          if (countErr) {
            console.error("Error counting lost samples:", countErr.message);
            return callback(countErr);
          }

          const totalCount = countResults[0].totalCount;
          return callback(null, { samples: results, totalCount });
        });
      });
    });
  });
};


const createSampleDispatch = (dispatchData, sampleID, callback) => {
  const {
    TransferFrom,
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity,
    status,
  } = dispatchData;

  const query = `
    INSERT INTO sampledispatch (
      TransferFrom,
      TransferTo,
      dispatchVia,
      dispatcherName,
      dispatchReceiptNumber,
      Quantity,
      sampleID,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlConnection.query(
    query,
    [
      TransferFrom,
      TransferTo,
      dispatchVia,
      dispatcherName,
      dispatchReceiptNumber,
      Quantity,
      sampleID,
      status,
    ],
    callback
  );
};

const getExistingDispatch = (sampleID, TransferFrom, TransferTo, callback) => {
  const query = `
    SELECT id FROM sampledispatch
    WHERE sampleID = ? AND TransferFrom = ? AND TransferTo = ? AND status = 'In Stock'
    ORDER BY id DESC LIMIT 1
  `;
  mysqlConnection.query(query, [sampleID, TransferFrom, TransferTo], callback);
};

const updateExistingDispatch = (dispatchData, dispatchId, callback) => {
  const {
    Quantity,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    TransferFrom,
    TransferTo,
    sampleID
  } = dispatchData;

  const updateDispatchQuery = `
    UPDATE sampledispatch
    SET 
      Quantity = ?, 
      dispatchVia = ?, 
      dispatcherName = ?, 
      dispatchReceiptNumber = ?, 
      TransferFrom = ?, 
      TransferTo = ?, 
      status = 'In Transit'
    WHERE id = ?
  `;

  mysqlConnection.query(
    updateDispatchQuery,
    [Quantity, dispatchVia, dispatcherName, dispatchReceiptNumber, TransferFrom, TransferTo, dispatchId],
    (err, result) => {
      if (err) {
        console.error("MySQL updateExistingDispatch error:", err);
        return callback(err);
      }


      // Correct: check by sampleID, not id
      const checkSampleReceiveQuery = `SELECT id FROM samplereceive WHERE sampleID = ? LIMIT 1`;
      mysqlConnection.query(checkSampleReceiveQuery, [sampleID], (checkErr, rows) => {
        if (checkErr) return callback(checkErr);

        if (rows.length > 0) {
          // Update by sampleID, not id
          const updateSampleReceiveQuery = `
  UPDATE samplereceive
  SET status = 'Returned'
  WHERE sampleID = ?
`;
          mysqlConnection.query(updateSampleReceiveQuery, [sampleID], (updateErr2) => {
            if (updateErr2) return callback(updateErr2);

            return callback(null, result);
          });
        } else {
          return callback(null, result);
        }
      });
    }
  );
};


// Update sample quantity
const updateSampleQuantity = (sampleID, Quantity, callback) => {
  const query = `UPDATE sample SET Quantity = Quantity - ? WHERE id = ?`;

  mysqlConnection.query(query, [Quantity, sampleID], callback);
};

// Update sample status from 'In Stock' to 'In Transit'
const updateSampleStatusToInTransit = (sampleID, callback) => {
  const query = `UPDATE sample SET status = 'In Transit' WHERE id = ? AND status = 'In Stock'`;

  mysqlConnection.query(query, [sampleID], callback);
};


// Get sample by ID
const getSampleById = (sampleID, callback) => {
  const query = `SELECT Quantity FROM sample WHERE id = ?`;

  mysqlConnection.query(query, [sampleID], callback);
};

// Handle lost sample
const markSampleLost = (reason, sampleID, dispatchID, TransferTo, callback) => {
  const query = `
    UPDATE sampledispatch
    SET Reason = ?, status = 'Lost'
    WHERE sampleID = ? AND id = ? AND TransferTo = ?
  `;

  mysqlConnection.query(query, [reason, sampleID, dispatchID, TransferTo], callback);
};

// Check existing return
const getReturnDispatch = (sampleID, from, to, callback) => {
  const query = `
    SELECT id FROM sampledispatch
    WHERE sampleID = ? AND TransferFrom = ? AND TransferTo = ? AND status = 'In Stock'
  `;
  mysqlConnection.query(query, [sampleID, from, to], callback);
};

// Mark return dispatch
const markReturned = (reason, dispatchID, callback) => {
  const query = `
    UPDATE sampledispatch
    SET status = 'Returned', Reason = ?
    WHERE id = ?
  `;

  mysqlConnection.query(query, [reason || "Returned", dispatchID], callback);
};

const getDispatchBySampleId = (sampleID, callback) => {
  const query = `
    SELECT id FROM sampledispatch
    WHERE sampleID = ?
    ORDER BY id DESC LIMIT 1
  `;
  mysqlConnection.query(query, [sampleID], callback);
};

module.exports = {
  createSampleDispatchTable,
  createSampleDispatch,
  getDispatchedwithInTransitStatus,
  getSampleLost,
  updateExistingDispatch,
  markReturned,
  getReturnDispatch,
  markSampleLost,
  getSampleById,
  updateSampleQuantity,
  updateSampleStatusToInTransit,
  getExistingDispatch,
  getDispatchBySampleId
};