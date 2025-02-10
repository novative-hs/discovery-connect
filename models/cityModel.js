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

const createCity = (data, callback) => {
  console.log('Received Request Body:', data); // Debugging

  const { bulkData, cityname, added_by } = data || {}; // Handle undefined gracefully

  mysqlConnection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }

    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

      const cityQuery = `
        INSERT INTO city (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;

      mysqlConnection.query(cityQuery, [values], (err, cityResult) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }

        const insertedCityIds = cityResult.insertId; // Get the first inserted city ID
        if (!insertedCityIds) {
          return mysqlConnection.rollback(() => {
            callback(new Error("Failed to retrieve city ID"), null);
          });
        }

        // Insert into RegistrationAdmin_History
        const historyValues = uniqueData.map(({ name, added_by }) => [
          name, added_by, insertedCityIds, 'active'
        ]);

        const historyQuery = `
          INSERT INTO RegistrationAdmin_History (created_name, added_by, city_id, status)
          VALUES ?
        `;

        mysqlConnection.query(historyQuery, [historyValues], (err, historyResult) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              callback(err, null);
            });
          }

          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                callback(err, null);
              });
            }
            callback(null, { cityResult, historyResult });
          });
        });
      });

    } else if (cityname && added_by) {
      const cityQuery = `
        INSERT INTO city (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;

      mysqlConnection.query(cityQuery, [cityname, added_by], (err, cityResult) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }

        const cityId = cityResult.insertId;
        if (!cityId) {
          return mysqlConnection.rollback(() => {
            callback(new Error("Failed to retrieve city ID"), null);
          });
        }

        // Insert into RegistrationAdmin_History
        const historyQuery = `
          INSERT INTO RegistrationAdmin_History (created_name,  added_by, city_id, status)
          VALUES (?, ?, ?, ?)
        `;

        mysqlConnection.query(historyQuery, [cityname, added_by, cityId, 'active'], (err, historyResult) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              callback(err, null);
            });
          }

          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                callback(err, null);
              });
            }
            callback(null, { cityResult, historyResult });
          });
        });
      });

    } else {
      callback(new Error('Invalid data'), null);
    }
  });
};


// Function to update a City member
const updateCity = (id, data, callback) => {
  const { cityname, added_by } = data;

  mysqlConnection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }
    const fetchCityQuery = `SELECT name FROM city WHERE id = ?`;
    mysqlConnection.query(fetchCityQuery, [id], (err, results) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          callback(err, null);
        });
      }

      if (results.length === 0) {
        return mysqlConnection.rollback(() => {
          callback(new Error("City not found"), null);
        });
      }

      const oldCityName = results[0].name; 
      const updateCityQuery = `
        UPDATE city
        SET name = ?, added_by = ?
        WHERE id = ?
      `;
      mysqlConnection.query(updateCityQuery, [cityname, added_by, id], (err, result) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }
        const updateHistoryQuery = `
          UPDATE RegistrationAdmin_History
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE city_id = ?
        `;

        mysqlConnection.query(updateHistoryQuery, [oldCityName, cityname, added_by, id], (err, historyResult) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              callback(err, null);
            });
          }

          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                callback(err, null);
              });
            }
            callback(null, { result, historyResult });
          });
        });
      });
    });
  });
};





const deleteCity = (id, callback) => {
  mysqlConnection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }

    // Step 1: Update the city status to 'inactive'
    const updateCityStatusQuery = `UPDATE city SET status = 'inactive' WHERE id = ?`;

    mysqlConnection.query(updateCityStatusQuery, [id], (err, result) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          callback(err, null);
        });
      }

      // Step 2: Update the status in RegistrationAdmin_History
      const updateHistoryStatusQuery = `
        UPDATE RegistrationAdmin_History
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE city_id = ?
      `;

      mysqlConnection.query(updateHistoryStatusQuery, [id], (err, historyResult) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }

        mysqlConnection.commit((err) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              callback(err, null);
            });
          }
          callback(null, { result, historyResult });
        });
      });
    });
  });
};


module.exports = {
  createCityTable,
  getAllCities,
  updateCity,
  createCity,
  deleteCity
};