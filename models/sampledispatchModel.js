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
      status VARCHAR(255) DEFAULT 'In Transit',
      TransferTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sampleID VARCHAR(36) NOT NULL,
      FOREIGN KEY (sampleID) REFERENCES sample(id),
      FOREIGN KEY (TransferTo) REFERENCES user_account(id) ON DELETE CASCADE,
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

// Function to get all samples with 'In Stock' status
// const getSampleDispatchesInTransit = (id, callback) => {
//   // Validate and parse `id`
//   const user_account_id = parseInt(id);
//   if (isNaN(user_account_id)) {
//     console.error("Invalid user_account_id:", id);
//     return callback(new Error("Invalid user_account_id"), null);
//   }

//   const query = `
//     SELECT s.*
//     FROM sample s
//     JOIN user_account ua ON s.user_account_id = ua.id
//     WHERE s.status = "In Transit" 
//       AND ua.accountType = "CollectionSites"
//       AND s.user_account_id = ?;
//   `;
//   mysqlConnection.query(query, [user_account_id], (err, results) => {
//     if (err) {
//       console.error('Database error:', err);
//       return callback(err, null);
//     }
//     callback(null, results);
//     console.log("data fetched:", results)
//   });
// };



// Function to fetch dispatched samples with 'In Transit' status
const getDispatchedwithInTransitStatus = (req, res) => {
  const user_account_id = parseInt(id);
  if (isNaN(user_account_id)) {
    console.error("Invalid user_account_id:", id);
    return callback(new Error("Invalid user_account_id"), null);
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
    sr.ReceivedByCollectionSite,

    -- Calculate the actual quantity available
    COALESCE((
        SELECT SUM(sd.Quantity) 
        FROM sampledispatch sd 
        WHERE sd.sampleID = s.id 
        AND sd.TransferTo = sr.ReceivedByCollectionSite
        AND sd.status = 'In Stock'
    ), 0) AS Quantity, 

    s.status

FROM samplereceive sr
INNER JOIN sample s ON sr.sampleID = s.id
WHERE sr.ReceivedByCollectionSite = ? 
AND s.status = 'In Stock'  
AND EXISTS (
    SELECT 1 
    FROM sampledispatch sd
    WHERE sd.sampleID = s.id 
    AND sd.TransferTo = sr.ReceivedByCollectionSite
    AND sd.status = 'In Stock'
)  
HAVING Quantity > 0
ORDER BY s.id;
  `;
  // Execute the query using the logged-in user's `user_account_id`
  mysqlConnection.query(query, [user_account_id], (err, results) => {
    if (err) {
      console.error("Database error fetching samples:", err.message);
      return res.status(500).json({ error: "An error occurred while fetching samples" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No samples found for this user" });
    }
    // Return the results (samples received by the user)
    res.status(200).json({ data: results });
  });
};


// Function to transfer sample 
const createSampleDispatch = (dispatchData, sampleID, callback) => {
  const { TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity } = dispatchData;

  const query = `
    INSERT INTO sampledispatch (TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity, sampleID)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlConnection.query(query, [TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity, sampleID], callback);
};



module.exports = {
  createSampleDispatchTable,
  // getSampleDispatchesInTransit,
  createSampleDispatch,
  getDispatchedwithInTransitStatus
};