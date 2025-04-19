const mysqlConnection = require("../config/db");

// List of tables and their columns to be added or removed
const tablesAndColumns = [
  {
    table: "history",
    columnsToAdd: [
      { column: "CommitteeType", type: "VARCHAR(20)", nullable: true },
    ],
  },
  {
    table: "organization",
    columnsToAdd: [
      {
        column: "created_at",
        type: "TIMESTAMP",
        default: "CURRENT_TIMESTAMP",
        nullable: true,
      },
      {
        column: "updated_at",
        type: "TIMESTAMP",
        default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        nullable: true,
      },
    ]
    },
    {
      table: "collectionsite",
      columnsToAdd: [
        {
          column: "created_at",
          type: "TIMESTAMP",
          default: "CURRENT_TIMESTAMP",
          nullable: true,
        },
        {
          column: "updated_at",
          type: "TIMESTAMP",
          default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
          nullable: true,
        },
      ]
      },
  {
    table:"registrationadmin_history",
    columnsToAdd:[
      {
        column: "CSR_id",
        type: "INT",
        nullable: true, // Change to true
        references: { table: "CSR", column: "id" },
      },
    ],
  },
  {
    table: "history",
    columnsToAdd: [
      { column: "CSRName", type: "VARCHAR(100)", nullable: true },
      {
        column: "CSR_id",
        type: "INT",
        nullable: true, // Change to true
        references: { table: "CSR", column: "id" },
      },
    ],
  },
  {
    table: "sample",
    columnsToAdd: [
      { column: "room_number", type: "INT", nullable: true },
      { column: "freezer_id", type: "INT", nullable: true },
      { column: "box_id", type: "INT", nullable: true },
    ],
  },
  {
    table: "committee_member",
    columnsToDelete: ["email", "password"],
    columnsToAdd: [
      {
        column: "user_account_id",
        type: "INT",
        nullable: true, // Change to true
        references: { table: "user_account", column: "id" },
      },
    ],
  },
  {
    table: "user_account",
    columnsToAdd: [
      {
        column: "OTP",
        type: "VARCHAR(4)",
        nullable: true,
      },
    ],
  },
  {
    table: "cart",
    columnsToAdd: [
      {
        column: "order_status",
        type: "ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending'",
      },
      {
        column: "payment_id",
        type: "INT",
        nullable: true, // Change to true
        references: { table: "payment", column: "id" },
      },
    ],
    columnsToDelete: ["payment_status", "payment_method"],
  },
];
const executeSequentially = async (tasks) => {
  for (let task of tasks) {
    try {
      await task();
    } catch (error) {
      console.error("Error executing task:", error);
    }
  }
};

// Function to check if column exists and add it if not
const ensureColumnsExist = (table, columns) => {
  columns.forEach(
    ({ column, type, nullable, default: defaultValue, references }) => {
      const checkColumnQuery = `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = '${table}' AND column_name = '${column}' AND table_schema = DATABASE()
    `;

      mysqlConnection.query(checkColumnQuery, (err, results) => {
        if (err) {
          console.error(
            `Error checking column ${column} in table ${table}:`,
            err
          );
          return;
        }

        if (results[0].count === 0) {
          let alterTableQuery = `ALTER TABLE ${table} ADD COLUMN ${column} ${type}`;

          if (nullable) {
            alterTableQuery += ` NULL`;
          } else {
            alterTableQuery += ` NOT NULL`;
          }

          // Add DEFAULT value if provided
          if (defaultValue !== undefined) {
            if (type.startsWith("VARCHAR") || type.startsWith("ENUM")) {
              alterTableQuery += ` DEFAULT '${defaultValue}'`; // Ensure strings are quoted
            } else {
              alterTableQuery += ` DEFAULT ${defaultValue}`;
            }
          }

          mysqlConnection.query(alterTableQuery, (err) => {
            if (err) {
              console.error(
                `Error adding column ${column} to table ${table}:`,
                err
              );
            } else {
              console.log(
                `Column ${column} added successfully to table ${table}.`
              );

              // Add Foreign Key Constraint after column creation
              if (references) {
                const fkName = `fk_${table}_${column}`;
                const addForeignKeyQuery = `
                ALTER TABLE ${table} 
                ADD CONSTRAINT ${fkName} 
                FOREIGN KEY (${column}) REFERENCES ${references.table}(${references.column}) 
                ON DELETE CASCADE
              `;

                setTimeout(() => {
                  mysqlConnection.query(addForeignKeyQuery, (err) => {
                    if (err) {
                      console.error(
                        `Error adding foreign key ${fkName} on ${table}.${column}:`,
                        err
                      );
                    } else {
                      console.log(
                        `Foreign key ${fkName} added successfully on ${table}.${column}.`
                      );
                    }
                  });
                }, 1000); // Adding slight delay to prevent deadlocks
              }
            }
          });
        } else {
          console.log(`Column ${column} already exists in table ${table}.`);
        }
      });
    }
  );
};

// Function to delete columns from a table
const deleteColumns = (table, columns) => {
  columns.forEach((column) => {
    const checkColumnQuery = `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = '${table}' AND column_name = '${column}' AND table_schema = DATABASE()
    `;

    mysqlConnection.query(checkColumnQuery, (err, results) => {
      if (err) {
        console.error(
          `Error checking column ${column} in table ${table}: `,
          err
        );
        return;
      }

      if (results[0].count > 0) {
        const alterTableQuery = `ALTER TABLE ${table} DROP COLUMN ${column}`;

        mysqlConnection.query(alterTableQuery, (err) => {
          if (err) {
            console.error(
              `Error deleting column ${column} from table ${table}: `,
              err
            );
          } else {
            console.log(
              `Column ${column} deleted successfully from table ${table}.`
            );
          }
        });
      } else {
        console.log(`Column ${column} does not exist in table ${table}.`);
      }
    });
  });
};
const updateEnumColumn = (table, column, enumValues, retries = 3) => {
  const enumList = enumValues.map((value) => `'${value}'`).join(", ");
  const alterEnumQuery = `
    ALTER TABLE ${table} 
    MODIFY COLUMN ${column} ENUM(${enumList}) NOT NULL DEFAULT '${enumValues[0]}'
  `;

  const attemptQuery = (retriesRemaining) => {
    mysqlConnection.query(alterEnumQuery, (err) => {
      if (err) {
        if (err.code === 'ER_LOCK_DEADLOCK' && retriesRemaining > 0) {
          console.log(`Deadlock detected, retrying... (${retriesRemaining} attempts left)`);
          setTimeout(() => attemptQuery(retriesRemaining - 1), 1000); // Retry after 1 second
        } else {
          console.error(`Error updating ENUM values for ${column} in ${table}:`, err);
        }
      } else {
        console.log(`Updated ENUM values for ${column} in ${table} successfully.`);
      }
    });
  };

  attemptQuery(retries);
};

const checkIfExists = (tableName, email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${tableName} WHERE email = ?`;
    mysqlConnection.query(query, [email], (err, results) => {
      if (err) {
        reject('Error checking record: ' + err);
      } else {
        resolve(results.length > 0); // true if exists
      }
    });
  });
};

const insertRecord = (tableName, record) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Checking if record exists for: ${record.email}`);
      const exists = await checkIfExists(tableName, record.email);
      if (exists) {
        resolve(`Record already exists for email: ${record.email}`);
        return;
      }

      console.log(`Inserting record for: ${record.email}`);
      const query = `
        INSERT INTO ${tableName} (email, password, accountType)
        VALUES (?, ?, ?)
      `;
      const values = [record.email, record.password, record.accountType];

      mysqlConnection.query(query, values, (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          reject('Error inserting record: ' + err);
        } else {
          resolve(`Record inserted: ${result.insertId}`);
        }
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      reject(err);
    }
  });
};

// Function to iterate through all tables and ensure columns exist or delete columns
const createOrUpdateTables = async () => {
  tablesAndColumns.forEach(({ table, columnsToAdd, columnsToDelete }) => {
    // Ensure columns exist for each table
    ensureColumnsExist(table, columnsToAdd);

    // Delete columns for each table (only if columnsToDelete is defined)
    if (columnsToDelete && columnsToDelete.length > 0) {
      deleteColumns(table, columnsToDelete);
    }
  });
  await executeSequentially([
    () =>
      ensureColumnsExist("user_account", [
        { column: "OTP", type: "VARCHAR(4)", nullable: true },
      ]),
    () =>
      updateEnumColumn("user_account", "accountType", [
        "Researcher",
        "Organization",
        "CollectionSites",
        "DatabaseAdmin",
        "RegistrationAdmin",
        "biobank",
        "Committeemember",
        "CSR"
      ]),
    () =>
      updateEnumColumn("cart", "order_status", [
        "Pending",
        "Accepted",
        "UnderReview",
        "Rejected",
        "Shipping",
        "Dispatched",
        "Completed",
      ]),
    () =>
      updateEnumColumn("committeesampleapproval", "committee_status", [
        "Review",
        "Approved",
        "Refused",
      ]),
  ]);
  
};

const updateAccountType = () => {
  const updateQuery = `
    UPDATE user_account 
    SET accountType = 'DatabaseAdmin' 
    WHERE accountType = 'RegistrationAdmin'
  `;

  mysqlConnection.query(updateQuery, (err, results) => {
    if (err) {
      console.error("Error updating accountType: ", err);
    } else {
      console.log(
        `Updated ${results.affectedRows} rows: accountType 'RegistrationAdmin' → 'DatabaseAdmin'`
      );
    }
  });
};
module.exports = {
  createOrUpdateTables,
  updateAccountType,
};
