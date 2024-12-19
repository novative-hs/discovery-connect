const mysqlConnection = require("../config/db");

const createSampleDispatchTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sampledispatch (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dispatchVia VARCHAR(255) NOT NULL,
      dispatcherName VARCHAR(255) NOT NULL,
      dispatchReceiptNumber VARCHAR(255) NOT NULL,
      sampleID INT NOT NULL,
      FOREIGN KEY (sampleID) REFERENCES sample(id)
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

const getSampleDispatchesInTransit = (callback) => {
    const query = 'SELECT * FROM sample WHERE status = "In Transit"';
    console.log('Executing query:', query); // Log the query
    mysqlConnection.query(query, callback);
  };

const createSampleDispatch = (dispatchData, sampleID, callback) => {
  const { dispatchVia, dispatcherName, dispatchReceiptNumber } = dispatchData;
  const query = `
    INSERT INTO sampledispatch (dispatchVia, dispatcherName, dispatchReceiptNumber, sampleID)
    VALUES (?, ?, ?, ?)
  `;
  
  mysqlConnection.query(query, [dispatchVia, dispatcherName, dispatchReceiptNumber, sampleID], callback);
};

module.exports = {
  createSampleDispatchTable,
  getSampleDispatchesInTransit,
  createSampleDispatch,
};
