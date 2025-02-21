const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");

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

const createCountry = (data, callback) => {
  console.log('Received Request Body:', data); // Debugging
  const { bulkData, countryname, added_by } = data || {}; // Handle undefined gracefully
  mysqlPool.getConnection((err, connection) => { // Use connection from pool
    if (err) {
      return callback(err, null);
    }
  connection.beginTransaction((err) => {
    if (err) {
      connection.release();
      return callback(err, null);
    }
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
      const cityQuery = `
        INSERT INTO country (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
      connection.query(cityQuery, [values], (err, countryResult) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }
        const insertedCountryIds = countryResult.insertId; // Get the first inserted country ID
        if (!insertedCountryIds) {
          return mysqlConnection.rollback(() => {
            callback(new Error("Failed to retrieve country ID"), null);
          });
        }
        // Insert into RegistrationAdmin_History
        const historyValues = uniqueData.map(({ name, added_by }) => [
          name, added_by, insertedCountryIds, 'active'
        ]);
        const historyQuery = `
          INSERT INTO RegistrationAdmin_History (created_name, added_by, country_id, status)
          VALUES ?
        `;
        connection.query(historyQuery, [historyValues], (err, historyResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }
            connection.release();
            callback(null, { countryResult, historyResult });
          });
        });
      });
    } else if (countryname && added_by) {
      const cityQuery = `
        INSERT INTO country (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
      connection.query(cityQuery, [countryname, added_by], (err, countryResult) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }
        const countryId = countryResult.insertId;
        if (!countryId) {
          return connection.rollback(() => {
            connection.release();
            callback(new Error("Failed to retrieve country ID"), null);
          });
        }
        // Insert into RegistrationAdmin_History
        const historyQuery = `
          INSERT INTO RegistrationAdmin_History (created_name,  added_by, country_id, status)
          VALUES (?, ?, ?, ?)
        `;
        connection.query(historyQuery, [countryname, added_by, countryId, 'active'], (err, historyResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }
            connection.release();
            callback(null, { countryResult, historyResult });
          });
        });
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  });
});
};

// Function to update a City 
const updateCountry = (id, data, callback) => {
  const { countryname, added_by } = data;
  mysqlPool.getConnection((err, connection) => { // Use connection from pool
    if (err) {
      return callback(err, null);
    }
  connection.beginTransaction((err) => {
    if (err) {
      connection.release();
      return callback(err, null);
    }
    const fetchCountryQuery = `SELECT name FROM country WHERE id = ?`;
    connection.query(fetchCountryQuery, [id], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          connection.release();
          callback(err, null);
        });
      }

      if (results.length === 0) {
        return connection.rollback(() => {
          connection.release();
          callback(new Error("Country not found"), null);
        });
      }

      const oldCountryName = results[0].name; 
      const updateCityQuery = `
        UPDATE country
        SET name = ?, added_by = ?
        WHERE id = ?
      `;
      connection.query(updateCityQuery, [countryname, added_by, id], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }
        const updateHistoryQuery = `
          UPDATE RegistrationAdmin_History
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE country_id = ?
        `;
        connection.query(updateHistoryQuery, [oldCountryName, countryname, added_by, id], (err, historyResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }
            connection.release();
            callback(null, { result, historyResult });
          });
        });
      });
    });
  });
  });
};

// Function to delete a Country
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