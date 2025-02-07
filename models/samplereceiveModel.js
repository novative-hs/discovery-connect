const mysqlConnection = require("../config/db");

const createSampleReceiveTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS samplereceive (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receiverName VARCHAR(255) NOT NULL,
      ReceivedByCollectionSite INT NOT NULL,
      ReceiveTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sampleID BIGINT NOT NULL,
      FOREIGN KEY (sampleID) REFERENCES sample(id),
      FOREIGN KEY (ReceivedByCollectionSite) REFERENCES user_account(id) ON DELETE CASCADE
    )
  `;

  mysqlConnection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating sample receive table:", err);
    } else {
      console.log("Sample receive table created or already exists.");
    }
  });
};

// Function to get all samples with 'In Stock' status
const getSampleReceiveInTransit = (id, callback) => {
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

const createSampleReceive = (receiveData, sampleID, callback) => {
  const { receiverName, ReceivedByCollectionSite } = receiveData;
  const query = `
    INSERT INTO samplereceive (receiverName, ReceivedByCollectionSite, sampleID)
    VALUES (?, ?, ?)
  `;
  
  mysqlConnection.query(query, [receiverName, ReceivedByCollectionSite, sampleID], callback);
};

module.exports = {
  createSampleReceiveTable,
  getSampleReceiveInTransit,
  createSampleReceive,
};