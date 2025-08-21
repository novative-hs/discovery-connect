const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");

// Function to create the city table
const createBankTable = () => {
  const createBankTable = `
    CREATE TABLE IF NOT EXISTS bank (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NULL,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createBankTable, (err, results) => {
    if (err) {
      console.error("Error creating Bank table: ", err);
    }
    else {
      console.log("Bank table created Successfully");
    }
  });
};


// Function to get all bank members
const getAllBank = (callback) => {
  const query = 'SELECT * FROM bank WHERE status = "active" ORDER BY name ASC';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Function to create bank
const createBank = (data, callback) => {
  const { bulkData, bankname, added_by } = data || {};

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

        const bankQuery = `
          INSERT IGNORE INTO bank (name, added_by)
          VALUES ?;
        `;

        connection.query(bankQuery, [values], (err, bankResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const fetchBankIdsQuery = `
            SELECT id, name FROM bank WHERE name IN (?);
          `;

          connection.query(fetchBankIdsQuery, [uniqueData.map(({ name }) => name)], (err, banks) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err, null);
              });
            }

            const historyValues = banks.map(({ id, name }) => [name, added_by, id, "active"]);

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, bank_id, status)
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
                callback(null, { bankResult, historyResult });
              });
            });
          });
        });

      } else if (bankname && added_by) {
        const bankQuery = `
          INSERT IGNORE INTO bank (name, added_by)
          VALUES (?, ?);
        `;

        connection.query(bankQuery, [bankname, added_by], (err, bankResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }

          const fetchBankIdQuery = `
            SELECT id FROM bank WHERE name = ?;
          `;

          connection.query(fetchBankIdQuery, [bankname], (err, bankRows) => {
            if (err || bankRows.length === 0) {
              return connection.rollback(() => {
                connection.release();
                callback(new Error("Failed to retrieve bank ID"), null);
              });
            }

            const bankId = bankRows[0].id;

            const historyQuery = `
              INSERT INTO registrationadmin_history (created_name, added_by, bank_id, status)
              VALUES (?, ?, ?, ?);
            `;

            connection.query(historyQuery, [bankname, added_by, bankId, "active"], (err, historyResult) => {
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
                callback(null, { bankResult, historyResult });
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
const updateBank = (id, data, callback) => {
  const { bankname, added_by } = data;
  mysqlPool.getConnection((err, connection) => { // Use connection from pool
    if (err) {
      return callback(err, null);
    }
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }
      const fetchCityQuery = `SELECT name FROM bank WHERE id = ?`;
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
            callback(new Error("Bank not found"), null);
          });
        }
        const oldBankName = results[0].name;
        const updateCityQuery = `
        UPDATE bank
        SET name = ?,added_by = ?
        WHERE id = ?
      `;
        connection.query(updateCityQuery, [bankname, added_by, id], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err, null);
            });
          }
          const updateHistoryQuery = `
          UPDATE registrationadmin_history
          SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
          WHERE bank_id = ?
        `;
          connection.query(updateHistoryQuery, [oldBankName, bankname, added_by, id], (err, historyResult) => {
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

// Function to delete Bank
const deleteBank = (id, callback) => {
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
      const updateCityStatusQuery = `UPDATE bank SET status = 'inactive' WHERE id = ?`;
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
        WHERE bank_id = ?
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

module.exports = {
  createBankTable,
  getAllBank,
  updateBank,
  createBank,
  deleteBank,

};