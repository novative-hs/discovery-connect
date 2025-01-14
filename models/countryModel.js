const mysqlConnection = require("../config/db");
// Function to create the Country table
const createCountryTable = () => {
  const createCountryTable = `
    CREATE TABLE IF NOT EXISTS country (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      added_by INT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;
  

  mysqlConnection.query(createCountryTable, (err, results) => {
    if (err) {
      console.error("Error creating Country table: ", err);
    } else {
      console.log("Country table created Successfully");
    }
  });
};

// Function to get all Country members
const getAllCountries = (callback) => {
  const query = 'SELECT * FROM country WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Function to insert a new Country member
const createCountry = (data, callback) => {
  const { countryname, added_by } = data;  // Destructure Countryname
  const query = `
    INSERT INTO country (name, added_by)
    VALUES (?, ?)
  `;
  mysqlConnection.query(query, [countryname, added_by], (err, result) => {  // Use Countryname here
    callback(err, result);
  });
};

// Function to update a Country member
const updateCountry = (id, data, callback) => {
  const { countryname, added_by } = data;
  const query = `
    UPDATE country
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [countryname, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};


// Function to delete a Country member
const deleteCountry = (id, callback) => {
  const query = 'UPDATE country SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createCountryTable,
  getAllCountries,
  updateCountry,
  createCountry,
  deleteCountry
};