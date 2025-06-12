const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");

const create_diagnosistestparameterTable = () => {
  const diagnosistestparameterTable = `
  CREATE TABLE IF NOT EXISTS diagnosistestparameter (
    id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
)`;
  mysqlConnection.query(diagnosistestparameterTable, (err, result) => {
    if (err) {
      console.error("Error creating diagnosis test parameter table: ", err);
    } else {
      console.log("diagnosis test parameter table created Successfully");
    }
  });
};

const getAlldiagnosisname=(callback)=>{
const query = 'SELECT * FROM diagnosistestparameter WHERE status = "active" ORDER BY name ASC';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });

}

const creatediagnosistestparameter = (data, callback) => {
  
  const { bulkData, diagnosistestparametername, added_by } = data || {};

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

        const diagnosisQuery = `
          INSERT INTO diagnosistestparameter (name, added_by)
          VALUES ?
          ON DUPLICATE KEY UPDATE name = VALUES(name);
        `;

        connection.query(diagnosisQuery, [values], (err, diagnosisResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const fetchDiagnosisIdsQuery = `
            SELECT id, name FROM diagnosistestparameter WHERE name IN (?);
          `;

          connection.query(fetchDiagnosisIdsQuery, [uniqueData.map(({ name }) => name)], (err, diagnosis) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            const historyValues = diagnosis.map(({ id, name }) => [name, added_by, id, "active"]);

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, diagnosistestparameter_id, status)
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
                callback(null, { diagnosisResult, historyResult });
              });
            });
          });
        });
      } else if (diagnosistestparametername && added_by) {
        const diagnosisQuery = `
          INSERT INTO diagnosistestparameter (name, added_by)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name);
        `;

        connection.query(diagnosisQuery, [diagnosistestparametername, added_by], (err, diagnosisResult) => {
          

          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const fetchDiagnosisIdQuery = `
            SELECT id FROM diagnosistestparameter WHERE name = ?;
          `;

          connection.query(fetchDiagnosisIdQuery, [diagnosistestparametername], (err, diagnosisRows) => {
            if (err || diagnosisRows.length === 0) {
              return connection.rollback(() => {
                connection.release();
                callback(new Error("Failed to retrieve diagnosistestparameter ID"), null);
              });
            }

            const diagnosisId = diagnosisRows[0].id;

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, diagnosistestparameter_id, status)
              VALUES (?, ?, ?, ?);
            `;

            connection.query(historyQuery, [diagnosistestparametername, added_by, diagnosisId, "active"], (err, historyResult) => {
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
                callback(null, { diagnosisResult, historyResult });
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

const deleteDagnosisname=(id,callback)=>{
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
          const updateDiagnosisStatusQuery = `UPDATE diagnosistestparameter SET status = 'inactive' WHERE id = ?`;
          connection.query(updateDiagnosisStatusQuery, [id], (err, result) => {
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
            WHERE diagnosistestparameter_id = ?
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

const updateDagnosisname = (id, data, callback) => {
  const { diagnosistestparametername, added_by } = data;

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err, null);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      const fetchOldNameQuery = `SELECT name FROM diagnosistestparameter WHERE id = ?`;
      connection.query(fetchOldNameQuery, [id], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err, null);
          });
        }

        if (results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            callback(new Error("Diagnosis test parameter not found"), null);
          });
        }

        const oldName = results[0].name;

        const updateDiagnosisQuery = `
          UPDATE diagnosistestparameter
          SET name = ?, added_by = ?
          WHERE id = ?
        `;

        connection.query(updateDiagnosisQuery, [diagnosistestparametername, added_by, id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const updateHistoryQuery = `
            UPDATE registrationadmin_history
            SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE diagnosistestparameter_id = ?
          `;

          connection.query(updateHistoryQuery, [oldName, diagnosistestparametername, added_by, id], (err, historyResult) => {
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


module.exports = {
  create_diagnosistestparameterTable,
getAlldiagnosisname,
  creatediagnosistestparameter,
deleteDagnosisname,
updateDagnosisname
};
