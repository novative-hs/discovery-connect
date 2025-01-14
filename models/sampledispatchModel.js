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
      TransferTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sampleID INT NOT NULL,
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
const getSampleDispatchesInTransit = (id, callback) => {
  // Validate and parse `id`
  const user_account_id = parseInt(id);
  if (isNaN(user_account_id)) {
    console.error("Invalid user_account_id:", id);
    return callback(new Error("Invalid user_account_id"), null);
  }

  const query = `
    SELECT s.*
    FROM sample s
    JOIN user_account ua ON s.user_account_id = ua.id
    WHERE s.status = "In Transit" 
      AND ua.accountType = "CollectionSites"
      AND s.user_account_id = ?;
  `;
  mysqlConnection.query(query, [user_account_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return callback(err, null);
    }
    callback(null, results);
    console.log("data fetched:", results)
  });
};

const createSampleDispatch = (dispatchData, sampleID, callback) => {
  const { TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber } = dispatchData;
  const query = `
    INSERT INTO sampledispatch (TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, sampleID)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  mysqlConnection.query(query, [TransferFrom, TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, sampleID], callback);
};

module.exports = {
  createSampleDispatchTable,
  getSampleDispatchesInTransit,
  createSampleDispatch,
};