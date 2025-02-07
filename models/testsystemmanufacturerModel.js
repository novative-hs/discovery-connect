const mysqlConnection = require("../config/db");
// Function to create the TestSystem table
const createTestSystemManufecturerTable = () => {
  const createTestSystemManufecturerTable = `
    CREATE TABLE IF NOT EXISTS testsystemanufacturer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createTestSystemManufecturerTable, (err, results) => {
    if (err) {
      console.error("Error creating Test System Manufecturer table: ", err);
    } else {
      console.log("Test System Manufecturer table created Successfully");
    }
  });
};

// Function to get all TestSystem Manufecturer
const getAllTestSystemManufecturer = (callback) => {
  const query = 'SELECT * FROM testsystemanufacturer WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const createTestSystemManufecturer = (data, callback, res) => {
  console.log('Received Request Body:', data); 

  const { bulkData, testsystemmanufacturername, added_by } = data || {};

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO testsystemanufacturer (name, added_by)
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
  } else if (testsystemmanufacturername && added_by) {
    const query = `
      INSERT INTO testsystemanufacturer (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [testsystemmanufacturername, added_by], (err, result) => {
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

// Function to update a Test System Manufecturer
const updateTestSystemManufecturer = (id, data, callback) => {
  const { testsystemmanufacturername, added_by } = data;
  const query = `
    UPDATE testsystemanufacturer
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [testsystemmanufacturername, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};


// Function to delete a Test System Manufecturer
const deleteTestSystemManufecturer= (id, callback) => {
  const query = 'UPDATE testsystemanufacturer SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};



module.exports = {
  createTestSystemManufecturerTable,
  getAllTestSystemManufecturer,
  updateTestSystemManufecturer,
  createTestSystemManufecturer,
  deleteTestSystemManufecturer,
};