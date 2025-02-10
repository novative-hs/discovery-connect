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


const createDistrict = (data, callback) => {
  console.log('Received Request Body:', data); // Debugging

  const { bulkData, districtname, added_by } = data || {}; // Handle undefined gracefully

  mysqlConnection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }

    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

      const districtQuery = `
        INSERT INTO district (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;

      mysqlConnection.query(districtQuery, [values], (err, districtResult) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }

        const insertedDistrictds = districtResult.insertId; // Get the first inserted city ID
        if (!insertedDistrictds) {
          return mysqlConnection.rollback(() => {
            callback(new Error("Failed to retrieve city ID"), null);
          });
        }

        // Insert into RegistrationAdmin_History
        const historyValues = uniqueData.map(({ name, added_by }) => [
          name, added_by, insertedDistrictds, 'active'
        ]);

        const historyQuery = `
          INSERT INTO RegistrationAdmin_History (created_name, added_by, district_id, status)
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
            callback(null, { districtResult, historyResult });
          });
        });
      });

    } else if (districtname && added_by) {
      const districtQuery = `
        INSERT INTO district (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;

      mysqlConnection.query(districtQuery, [districtname, added_by], (err, districtResult) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }

        const districtId = districtResult.insertId;
        if (!districtId) {
          return mysqlConnection.rollback(() => {
            callback(new Error("Failed to retrieve district ID"), null);
          });
        }

        // Insert into RegistrationAdmin_History
        const historyQuery = `
          INSERT INTO RegistrationAdmin_History (created_name,  added_by, district_id, status)
          VALUES (?, ?, ?, ?)
        `;

        mysqlConnection.query(historyQuery, [districtname, added_by, districtId, 'active'], (err, historyResult) => {
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
            callback(null, { districtResult, historyResult });
          });
        });
      });

    } else {
      callback(new Error('Invalid data'), null);
    }
  });
};


// Function to update a City member
const updateDistrict = (id, data, callback) => {
  const { districtname, added_by } = data;

  mysqlConnection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }
    const fetchDistrictQuery = `SELECT name FROM district WHERE id = ?`;
    mysqlConnection.query(fetchDistrictQuery, [id], (err, results) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          callback(err, null);
        });
      }

      if (results.length === 0) {
        return mysqlConnection.rollback(() => {
          callback(new Error("District not found"), null);
        });
      }

      const oldDistrictName = results[0].name;
      const updateDistrictQuery = `
        UPDATE district
        SET name = ?, added_by = ?
        WHERE id = ?
      `;
      mysqlConnection.query(updateDistrictQuery, [districtname, added_by, id], (err, result) => {
        if (err) {
          return mysqlConnection.rollback(() => {
            callback(err, null);
          });
        }
        const updateHistoryQuery = `
          UPDATE RegistrationAdmin_History
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE district_id = ?
        `;

        mysqlConnection.query(updateHistoryQuery, [oldDistrictName, districtname, added_by, id], (err, historyResult) => {
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