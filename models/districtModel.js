const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");

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
  const query = 'SELECT * FROM district WHERE status = "active" ORDER BY name ASC';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


const createDistrict = (data, callback) => {
  
  const { bulkData, districtname, added_by } = data || {};

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

        const districtQuery = `
          INSERT INTO district (name, added_by)
          VALUES ?
          ON DUPLICATE KEY UPDATE name = VALUES(name);
        `;

        connection.query(districtQuery, [values], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          // ✅ Fetch the correct `id`s from the country table
          const districtNames = uniqueData.map(({ name }) => name);
          const fetchIdsQuery = `
            SELECT id, name FROM district WHERE name IN (?);
          `;

          connection.query(fetchIdsQuery, [districtNames], (err, results) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            // ✅ Map country names to correct IDs
            const districtMap = new Map(results.map(({ id, name }) => [name, id]));
            const historyValues = uniqueData.map(({ name, added_by }) => [
              name,
              added_by,
              districtMap.get(name), // ✅ Use the correct `country_id`
              "active",
            ]);

            const historyQuery = `
              INSERT INTO databaseadmin_history (created_name, added_by, district_id, status)
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
                callback(null, { message: "Bulk data inserted successfully", historyResult });
              });
            });
          });
        });
      } 
      
      else if (districtname && added_by) {
        const districtQuery = `
          INSERT INTO district (name, added_by)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name);
        `;

        connection.query(districtQuery, [districtname, added_by], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          // ✅ Fetch correct country ID
          const fetchIdQuery = `SELECT id FROM district WHERE name = ?`;

          connection.query(fetchIdQuery, [districtname], (err, result) => {
            if (err || result.length === 0) {
              return connection.rollback(() => {
                connection.release();
                callback(err || new Error("district ID not found"), null);
              });
            }

            const districtId = result[0].id;

            const historyQuery = `
              INSERT INTO databaseadmin_history (created_name, added_by, district_id, status)
              VALUES (?, ?, ?, ?);
            `;

            connection.query(historyQuery, [districtname, added_by, districtId, "active"], (err, historyResult) => {
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
                callback(null, { message: "Single district inserted successfully", historyResult });
              });
            });
          });
        });
      } 
      
      else {
        connection.release();
        callback(new Error("Invalid data"), null);
      }
    });
  });
};




// Function to update a district
const updateDistrict = (id, data, callback) => {
  const { districtname, added_by } = data;
  mysqlPool.getConnection((err, connection) => { // Use connection from pool
    if (err) {
      return callback(err, null);
    }
  connection.beginTransaction((err) => {
    if (err) {
      connection.release();
      return callback(err, null);
    }
    const fetchDistrictQuery = `SELECT name FROM district WHERE id = ?`;
    connection.query(fetchDistrictQuery, [id], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          connection.release();
          callback(err, null);
        });
      }

      if (results.length === 0) {
        return connection.rollback(() => {
          connection.release();
          callback(new Error("District not found"), null);
        });
      }
      const oldDistrictName = results[0].name;
      const updateDistrictQuery = `
        UPDATE district
        SET name = ?, added_by = ?
        WHERE id = ?
      `;
      connection.query(updateDistrictQuery, [districtname, added_by, id], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }
        const updateHistoryQuery = `
          UPDATE databaseadmin_history
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE district_id = ?
        `;
        connection.query(updateHistoryQuery, [oldDistrictName, districtname, added_by, id], (err, historyResult) => {
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