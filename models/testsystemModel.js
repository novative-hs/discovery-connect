const mysqlConnection = require("../config/db");
// Function to create the TestSystem table
const createTestSystemTable = () => {
  const createTestSystem = `
    CREATE TABLE IF NOT EXISTS testsystem (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createTestSystem, (err, results) => {
    if (err) {
      console.error("Error creating Test System table: ", err);
    } else {
      console.log("Test System table created Successfully");
    }
  });
};

// Function to get all TestSystem
const getAllTestSystem = (callback) => {
  const query = 'SELECT * FROM testsystem WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const createTestSystem = (data, callback, res) => {
  console.log('Received Request Body:', data); 

  const { bulkData, testsystemname, added_by } = data || {};

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO testsystem (name, added_by)
      VALUES ?
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [values], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        console.log("Insert Result:", result); // Debugging result
        callback(null, result);
      }
    });
  } else if (testsystemname && added_by) {
    const query = `
      INSERT INTO testsystem (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [testsystemname, added_by], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  } else {
    callback(new Error('Invalid data'), null);
  }
};

// Function to update a TestSystem 
const updateTestSystem = (id, data, callback) => {
  const { testsystemname, added_by } = data;
  const query = `
    UPDATE testsystem
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [testsystemname, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};


// Function to delete a TestSystem 
const deleteTestSystem= (id, callback) => {
  const query = 'UPDATE testsystem SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};



module.exports = {
  createTestSystemTable,
  getAllTestSystem,
  updateTestSystem,
  createTestSystem,
  deleteTestSystem,
};