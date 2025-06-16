const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
const { sendEmail } = require("../config/email");

const create_AnalyteTable = () => {
  const AnalyteTable = `
  CREATE TABLE IF NOT EXISTS Analyte (
    id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
)`;
  mysqlConnection.query(AnalyteTable, (err, result) => {
    if (err) {
      console.error("Error creating Analyte table: ", err);
    } else {
      console.log("Analyte table created Successfully");
    }
  });
};

const getAllAnalytename=(callback)=>{
const query = 'SELECT * FROM analyte WHERE status = "active" ORDER BY name ASC';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });

}

const createAnalyte = (data, callback) => {
  const { bulkData = [], Analytename, added_by } = data || {};

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err, null);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      // Bulk insert flow
      if (bulkData.length > 0) {
        const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
        const values = uniqueData.map(({ name }) => [name, added_by]);

        const insertQuery = `
          INSERT INTO analyte (name, added_by)
          VALUES ?
          ON DUPLICATE KEY UPDATE name = VALUES(name);
        `;

        connection.query(insertQuery, [values], (err, insertResult) => {
          if (err) return connection.rollback(() => connection.release(), callback(err, null));

          const fetchIdsQuery = `SELECT id, name FROM analyte WHERE name IN (?);`;

          connection.query(fetchIdsQuery, [uniqueData.map(({ name }) => name)], (err, rows) => {
            if (err) return connection.rollback(() => connection.release(), callback(err, null));

            const historyValues = rows.map(({ id, name }) => [name, added_by, id, "active"]);
            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, Analyte_id, status)
              VALUES ?;
            `;

            connection.query(historyQuery, [historyValues], (err, historyResult) => {
              if (err) return connection.rollback(() => connection.release(), callback(err, null));

              connection.commit((err) => {
                if (err) return connection.rollback(() => connection.release(), callback(err, null));
                connection.release();
                callback(null, { insertResult, historyResult });
              });
            });
          });
        });

      // Single insert flow
      } else if (Analytename && added_by) {
        const insertQuery = `
          INSERT INTO analyte (name, added_by)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name);
        `;

        connection.query(insertQuery, [Analytename, added_by], (err, insertResult) => {
          if (err) return connection.rollback(() => connection.release(), callback(err, null));

          const fetchIdQuery = `SELECT id FROM analyte WHERE name = ?;`;

          connection.query(fetchIdQuery, [Analytename], (err, rows) => {
            if (err || rows.length === 0)
              return connection.rollback(() => connection.release(), callback(new Error("Failed to retrieve Analyte ID"), null));

            const analyteId = rows[0].id;

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, Analyte_id, status)
              VALUES (?, ?, ?, ?);
            `;

            connection.query(historyQuery, [Analytename, added_by, analyteId, "active"], (err, historyResult) => {
              if (err) return connection.rollback(() => connection.release(), callback(err, null));

              connection.commit((err) => {
                if (err) return connection.rollback(() => connection.release(), callback(err, null));
                connection.release();
                callback(null, { insertResult, historyResult });
              });
            });
          });
        });

      } else {
        connection.release();
        callback(new Error("Invalid data: Missing bulkData or Analytename"), null);
      }
    });
  });
};


const deleteAnalytename=(id,callback)=>{
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
          const updateAnalyteStatusQuery = `UPDATE analyte SET status = 'inactive' WHERE id = ?`;
          connection.query(updateAnalyteStatusQuery, [id], (err, result) => {
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
            WHERE analyte_id = ?
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

const updateAnalytename = (id, data, callback) => {
  const { Analytename, added_by } = data;

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err, null);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      const fetchOldNameQuery = `SELECT name FROM analyte WHERE id = ?`;
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
            callback(new Error("Analyte not found"), null);
          });
        }

        const oldName = results[0].name;

        const updateAnalyteQuery = `
          UPDATE analyte
          SET name = ?, added_by = ?
          WHERE id = ?
        `;

        connection.query(updateAnalyteQuery, [Analytename, added_by, id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const updateHistoryQuery = `
            UPDATE registrationadmin_history
            SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE Analyte_id = ?
          `;

          connection.query(updateHistoryQuery, [oldName, Analytename, added_by, id], (err, historyResult) => {
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
  create_AnalyteTable,
getAllAnalytename,
  createAnalyte,
deleteAnalytename,
updateAnalytename
};
