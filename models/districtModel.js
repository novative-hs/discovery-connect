const mysqlConnection = require("../config/db");
// Function to create the city table
const createDistrictTable = () => {
  const createDistrictTable = `
  CREATE TABLE IF NOT EXISTS district (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
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

// Function to insert a new City member
const createDistrict = (data, callback) => {
  const { districtname, added_by } = data;  // Destructure districtname
  const query = `
    INSERT INTO district (name, added_by)
    VALUES (?, ?)
  `;
  mysqlConnection.query(query, [districtname, added_by], (err, result) => {  // Use districtname here
    callback(err, result);
  });
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