const mysqlConnection = require("../config/db");
// Function to create the Country table
const createCountryTable = () => {
  const createCountryTable = `
    CREATE TABLE IF NOT EXISTS country (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
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



const createCountry = (data, callback, res) => {
  console.log('Received Request Body:', data); // Debugging

  const { bulkData, countryname, added_by } = data || {}; // Handle undefined gracefully

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO country (name, added_by)
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
  } else if (countryname && added_by) {
    const query = `
      INSERT INTO country (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [countryname, added_by], (err, result) => {
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