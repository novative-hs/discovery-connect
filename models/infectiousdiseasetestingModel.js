const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");

const create_infectiousdiseaseTable=()=>{
     const createInfectiousdiseaseTable = `
    CREATE TABLE IF NOT EXISTS infectiousdiseasetesting (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;
    mysqlConnection.query(createInfectiousdiseaseTable, (err, results) => {
    if (err) {
      console.error("Error creating infectious disease table: ", err);
    }
  });
}

const getAllinfectiousdisease=(callback)=>{
    const query = 'SELECT * FROM infectiousdiseasetesting WHERE status = "active" ORDER BY name ASC';
      mysqlConnection.query(query, (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, results);
        }
      });
  }
const createinfectiousdisease=(data,callback)=>{
    console.log(data)
    const { bulkData, infectiousdiseasename, added_by } = data || {};

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

        const infectiousdiseaseQuery = `
          INSERT IGNORE INTO infectiousdiseasetesting (name, added_by)
          VALUES ?;
        `;

        connection.query(infectiousdiseaseQuery, [values], (err, infectiousdiseaseResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          // Retrieve all inserted city IDs
          const fetchinfectiousdiseaseIdsQuery = `
            SELECT id, name FROM infectiousdiseasetesting WHERE name IN (?);
          `;

          connection.query(fetchinfectiousdiseaseIdsQuery, [uniqueData.map(({ name }) => name)], (err, infectiousdisease) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            const historyValues = infectiousdisease.map(({ id, name }) => [name, added_by, id, "active"]);

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, infectiousdisease_id, status)
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
                callback(null, { infectiousdiseaseResult, historyResult });
              });
            });
          });
        });
      } else if (infectiousdiseasename && added_by) {
        const infectiousdiseaseQuery = `
          INSERT IGNORE INTO infectiousdiseasetesting (name, added_by)
          VALUES (?, ?);
        `;

        connection.query(infectiousdiseaseQuery, [infectiousdiseasename, added_by], (err, infectiousdiseaseResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const fetchinfectiousdiseaseIdQuery = `
            SELECT id FROM infectiousdiseasetesting WHERE name = ?;
          `;

          connection.query(fetchinfectiousdiseaseIdQuery, [infectiousdiseasename], (err, infectiousdiseaseRows) => {
            if (err || infectiousdiseaseRows.length === 0) {
              return connection.rollback(() => {
                connection.release();
                callback(new Error("Failed to retrieve infectiousdisease ID"), null);
              });
            }

            const cityId = infectiousdiseaseRows[0].id;

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, infectiousdisease_id, status)
              VALUES (?, ?, ?, ?);
            `;

            connection.query(historyQuery, [infectiousdiseasename, added_by, cityId, "active"], (err, historyResult) => {
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
                callback(null, { infectiousdiseaseResult, historyResult });
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
}



  const deleteinfectiousdisease=(id,callback)=>{
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
          const updateCityStatusQuery = `UPDATE infectiousdiseasetesting SET status = 'inactive' WHERE id = ?`;
          connection.query(updateCityStatusQuery, [id], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }
            // Step 2: Update the status in registrationadmin_history
            const updateHistoryStatusQuery = `
            UPDATE registrationadmin_history
            SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
            WHERE infectiousdisease_id = ?
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
  }
  const updateinfectiousdisease=(id,data,callback)=>{
const { infectiousdiseasename, added_by } = data;
  mysqlPool.getConnection((err, connection) => { // Use connection from pool
    if (err) {
      return callback(err, null);
    }
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }
      const fetchinfectiousdiseaseQuery = `SELECT name FROM infectiousdiseasetesting WHERE id = ?`;
      mysqlConnection.query(fetchinfectiousdiseaseQuery, [id], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }
        if (results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            callback(new Error("infectious disease not found"), null);
          });
        }
        const oldinfectiousdiseaseName = results[0].name;
        const updateinfectiousdiseaseQuery = `
        UPDATE infectiousdiseasetesting
        SET name = ?, added_by = ?
        WHERE id = ?
      `;
        connection.query(updateinfectiousdiseaseQuery, [infectiousdiseasename, added_by, id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }
          const updateHistoryQuery = `
          UPDATE registrationadmin_history
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE infectiousdisease_id = ?
        `;
          connection.query(updateHistoryQuery, [oldinfectiousdiseaseName, infectiousdiseasename, added_by, id], (err, historyResult) => {
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
  }

module.exports = {
create_infectiousdiseaseTable,
getAllinfectiousdisease,
createinfectiousdisease,
updateinfectiousdisease,
deleteinfectiousdisease,
}