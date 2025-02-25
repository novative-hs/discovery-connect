const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");

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

// Function to create City
const createCity = (data, callback) => {
  console.log("Received Request Body:", data);
  const { bulkData, cityname, added_by } = data || {};

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err, null);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      if (bulkData) {
        const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
        const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

        const cityQuery = `
          INSERT IGNORE INTO city (name, added_by)
          VALUES ?;
        `;

        connection.query(cityQuery, [values], (err, cityResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          // Retrieve all inserted city IDs
          const fetchCityIdsQuery = `
            SELECT id, name FROM city WHERE name IN (?);
          `;

          connection.query(fetchCityIdsQuery, [uniqueData.map(({ name }) => name)], (err, cities) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            const historyValues = cities.map(({ id, name }) => [name, added_by, id, "active"]);

            const historyQuery = `
              INSERT INTO RegistrationAdmin_History (created_name, added_by, city_id, status)
              VALUES ?;
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
                callback(null, { cityResult, historyResult });
              });
            });
          });
        });
      } else if (cityname && added_by) {
        const cityQuery = `
          INSERT IGNORE INTO city (name, added_by)
          VALUES (?, ?);
        `;

        connection.query(cityQuery, [cityname, added_by], (err, cityResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const fetchCityIdQuery = `
            SELECT id FROM city WHERE name = ?;
          `;

          connection.query(fetchCityIdQuery, [cityname], (err, cityRows) => {
            if (err || cityRows.length === 0) {
              return connection.rollback(() => {
                connection.release();
                callback(new Error("Failed to retrieve city ID"), null);
              });
            }

            const cityId = cityRows[0].id;

            const historyQuery = `
              INSERT INTO RegistrationAdmin_History (created_name, added_by, city_id, status)
              VALUES (?, ?, ?, ?);
            `;

            connection.query(historyQuery, [cityname, added_by, cityId, "active"], (err, historyResult) => {
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
                callback(null, { cityResult, historyResult });
              });
            });
          });
        });
      } else {
        connection.release();
        callback(new Error("Invalid data"), null);
      }
    });
  });
};


// Function to update City
const updateCity = (id, data, callback) => {
  const { cityname, added_by } = data;
  mysqlPool.getConnection((err, connection) => { // Use connection from pool
    if (err) {
      return callback(err, null);
    }
  connection.beginTransaction((err) => {
    if (err) {
      connection.release();
      return callback(err, null);
    }
    const fetchCityQuery = `SELECT name FROM city WHERE id = ?`;
    mysqlConnection.query(fetchCityQuery, [id], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          connection.release();
          callback(err, null);
        });
      }
      if (results.length === 0) {
        return connection.rollback(() => {
          connection.release();
          callback(new Error("City not found"), null);
        });
      }
      const oldCityName = results[0].name; 
      const updateCityQuery = `
        UPDATE city
        SET name = ?, added_by = ?
        WHERE id = ?
      `;
      connection.query(updateCityQuery, [cityname, added_by, id], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }
        const updateHistoryQuery = `
          UPDATE RegistrationAdmin_History
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE city_id = ?
        `;
        connection.query(updateHistoryQuery, [oldCityName, cityname, added_by, id], (err, historyResult) => {
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

// Function to delete City
const deleteCity = (id, callback) => {
  mysqlPool.getConnection((err, connection) => {
    if (err) {
      return callback(err, null);
    }
  connection.beginTransaction((err) => {
    if (err) {
      connection.release();
      return callback(err, null);
    }
    // Step 1: Update the city status to 'inactive'
    const updateCityStatusQuery = `UPDATE city SET status = 'inactive' WHERE id = ?`;
    connection.query(updateCityStatusQuery, [id], (err, result) => {
      if (err) {
        return connection.rollback(() => {
          connection.release();
          callback(err, null);
        });
      }
      // Step 2: Update the status in RegistrationAdmin_History
      const updateHistoryStatusQuery = `
        UPDATE RegistrationAdmin_History
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE city_id = ?
      `;
      connection.query(updateHistoryStatusQuery, [id], (err, historyResult) => {
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
          callback(null, { result, historyResult });
        });
      });
    });
  });
});
};

const getCount = (callback) => {
  // Queries to get the record count for each table
  const queries = {
    totalCities: 'SELECT COUNT(*) AS count FROM city',
    totalDistricts: 'SELECT COUNT(*) AS count FROM district',
    totalCountries: 'SELECT COUNT(*) AS count FROM country',
    totalResearchers: 'SELECT COUNT(*) AS count FROM researcher',
    totalOrganizations: 'SELECT COUNT(*) AS count FROM organization',
    totalCommitteeMembers: 'SELECT COUNT(*) AS count FROM committee_member',
    totalCollectionSites: 'SELECT COUNT(*) AS count FROM collectionsite',
    totalOrders: 'SELECT COUNT(*) AS count FROM cart'
  };

  let results = {};

  // Function to execute queries sequentially
  const executeQuery = (key, query) => {
    return new Promise((resolve, reject) => {
      mysqlConnection.query(query, (err, result) => {
        if (err) {
          console.log(err)
          reject(err); // If any query fails, reject the promise
        } else {
          results[key] = result[0].count; // Store the count for each table
          resolve();
        }
      });
    });
  };

  // Run all queries concurrently
  Promise.all(Object.entries(queries).map(([key, query]) => executeQuery(key, query)))
    .then(() => {
      callback(null, results); // Return the counts when all queries have completed
    })
    .catch((err) => {
      callback(err, null); // If any error occurs, pass the error to the callback
    });
};



module.exports = {
  createCityTable,
  getAllCities,
  updateCity,
  createCity,
  deleteCity,
  getCount
};