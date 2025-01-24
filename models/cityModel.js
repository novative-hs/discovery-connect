const mysqlConnection = require("../config/db");
// Function to create the city table
const createCityTable = () => {
  const createCityTable = `
    CREATE TABLE IF NOT EXISTS city (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createCityTable, (err, results) => {
    if (err) {
      console.error("Error creating City table: ", err);
    } else {
      console.log("City table created Successfully");
    }
  });
};

// Function to get all City members
const getAllCities = (callback) => {
  const query = 'SELECT * FROM city WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const createCity = (data, callback, res) => {
  console.log('Received Request Body:', data); // Debugging

  const { bulkData, cityname, added_by } = data || {}; // Handle undefined gracefully

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO city (name, added_by)
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
  } else if (cityname && added_by) {
    const query = `
      INSERT INTO city (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [cityname, added_by], (err, result) => {
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
const updateCity = (id, data, callback) => {
  const { cityname, added_by } = data;
  const query = `
    UPDATE city
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [cityname, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};


// Function to delete a City member
const deleteCity = (id, callback) => {
  const query = 'UPDATE city SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createCityTable,
  getAllCities,
  updateCity,
  createCity,
  deleteCity
};