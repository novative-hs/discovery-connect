const mysqlConnection = require("../config/db");
// Function to create the city table
const createDistrictTable = () => {
  const createDistrictTable = `
  CREATE TABLE IF NOT EXISTS district (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    added_by INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE 
  )`; 

  mysqlConnection.query(createDistrictTable, (err, results) => {
    if (err) {
      console.error("Error creating district table: ", err);
    } else {
      console.log("District table created Successfully");
    }
  });
};

// Function to get all City members
const getAllDistricts = (callback) => {
  const query = 'SELECT * FROM district WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const createDistrict = (data, callback, res) => {
  console.log('Received Request Body:', data); // Debugging

  const { bulkData, districtname, added_by } = data || {}; // Handle undefined gracefully

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO district (name, added_by)
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
  } else if (districtname && added_by) {
    const query = `
      INSERT INTO district (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [districtname, added_by], (err, result) => {
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
// Function to update a City member
const updateDistrict = (id, data, callback) => {
  const { districtname, added_by } = data;
  const query = `
    UPDATE district
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [districtname, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};


// Function to delete a City member
const deleteDistrict = (id, callback) => {
  const query = 'UPDATE district SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createDistrictTable,
  getAllDistricts,
  updateDistrict,
  createDistrict,
  deleteDistrict
};