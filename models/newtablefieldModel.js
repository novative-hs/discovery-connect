const mysqlConnection = require("../config/db");
const tablesAndColumns = [

  // {
  //   table: "csr",
  //   columnsToAdd: [
  //     {
  //       column: "collection_id",
  //       type: "INT",
  //       nullable: true, // Change to true
  //       references: { table: "collectionsite", column: "id" },
  //     },
  //   ]
  // },
  {
    table: "sampledispatch",
    columnsToAdd: [
      {
        column: "Reason",
        type: "TEXT",
        nullable: true,
      },
    ]
  },
  {
    table: "sample",
    columnsToDelete: ["DiagnosisTestParameter"],
    columnsToAdd: [
      {
        column: "volume",
        type: "DOUBLE",
        nullable: true,
      },
      {
        column: "updated_at",
        type: "DATETIME",
        default: "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
      },
    ]
  },
  {
    table: "registrationadmin_history",
    columnsToAdd: [
      {
        column: "infectiousdisease_id",
        type: "INT",
        nullable: true, // Change to true
        references: { table: "infectiousdiseasetesting", column: "id" },
      },
    ]
  },

  {
    table: "csr",
    columnsToAdd: [
      {
        column: "permission",
        type: "VARCHAR(15)",
        nullable: true,
      }
    ]

  },

  {
    table: "registrationadmin_history",
    columnsToAdd: [
      {
        column: "diagnosistestparameter_id",
        type: "INT",
        nullable: true, // Change to true
        references: { table: "diagnosistestparameter", column: "id" },
      },
    ]
  },
  {
    table: "cart",
    columnsToAdd: [
      {
        column: "volume",
        type: "VARCHAR(255)",
        nullable: false
      },
      {
        column: "QuantityUnit",
        type: "VARCHAR(20)",
        nullable: false
      }
    ]
  },
  {
    table: "sample_history",
    columnsToAdd: [
      {
        column: "user_account_id",
        type: "BIGINT",
        nullable: true,
      },
      {
        column: "updated_name",
        type: "VARCHAR(255)",
        nullable: true,
      },
      {
        column: "action_type",
        type: "ENUM('add', 'update')",
        defaultTo: "'add'",
        nullable: true,
      },
    ]
  },
  {
    table: "samplereceive",
    columnsToAdd: [
      {
        column: "status",
        type: "ENUM('Returned', 'Received') DEFAULT 'Received'",
        nullable: false,

      }
    ]
  }
  // {
  //   table: "user_account",
  //   columnsToAdd: [
  //     //   {
  //     //     column: "accountType",
  //     //     type: "ENUM('Researcher','Organization','CollectionSites','RegistrationAdmin','TechnicalAdmin','biobank','Committeemember','CSR')"
  //     //   },
  //     {
  //       column: "password",
  //       type: "VARCHAR(255) DEFAULT NULL"
  //     }
  //   ]
  // },
  // {
  //   table: "organization",
  //   columnsToDelete: ["ntnNumber", "user_account_id"],
  //   columnsToAdd: [
  //     {
  //       column: "website",
  //       type: "VARCHAR(250) Null",
  //     },
  //     {
  //       column: "email",
  //       type: "VARCHAR(255) NULL",
  //     },
  //   ]
  // },
  // {
  //   table: "collectionsite",
  //   columnsToDelete: ["user_account_id"],
  // },

  // {
  //   table: "history",
  //   columnsToDelete: ["ntnNumber"],
  //   columnsToAdd: [
  //     {
  //       column: "website",
  //       type: "VARCHAR(250)",
  //       nullable: true, // Change to true
  //     },
  //     {
  //       column: "staffName",
  //       type: "VARCHAR(1000)",
  //       nullable: true, // Change to true
  //     },
  //     {
  //       column: "action",
  //       type: "VARCHAR(20)",
  //       nullable: true, // Change to true
  //     },

  //     {
  //       column: "collectionsitestaff_id",
  //       type: "INT",
  //       nullable: true, // Change to true
  //       references: { table: "collectionsitestaff", column: "id" },
  //     },
  //     {
  //       column: "status",
  //       type: "ENUM('added', 'updated', 'deleted', 'active','inactive') NULL DEFAULT 'added'",
  //     },
  //   ]
  // },

  // {
  //   table: "cart",
  //   columnsToAdd: [
  //     {
  //       column: "order_status",
  //       type: "ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending'",
  //     },
  //     {
  //       column: "payment_id",
  //       type: "INT",
  //       nullable: true, // Change to true
  //       references: { table: "payment", column: "id" },
  //     },
  //     {
  //       column: "delivered_at",
  //       type: "DATETIME",
  //       nullable: true,
  //     },
  //   ],
  //   columnsToDelete: ["payment_status", "payment_method"],
  // },
];

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

const renameColumn = (table, oldColumn, newColumn, type) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE table_name = '${table}' AND column_name = '${oldColumn}' AND table_schema = DATABASE()
  `;

  mysqlConnection.query(checkColumnQuery, (err, results) => {
    if (err) {
      console.error(`Error checking column ${oldColumn} in table ${table}:`, err);
      return;
    }

    if (results[0].count > 0) {
      const renameQuery = `ALTER TABLE ${table} CHANGE ${oldColumn} ${newColumn} ${type}`;

      mysqlConnection.query(renameQuery, (err) => {
        if (err) {
          console.error(`Error renaming column ${oldColumn} to ${newColumn} in table ${table}:`, err);
        } else {
          console.log(`Column ${oldColumn} successfully renamed to ${newColumn} in table ${table}.`);
        }
      });
    } else {
      console.log(`Column ${oldColumn} does not exist in table ${table}.`);
    }
  });
};

const updateEnumColumn = (table, column, enumValues, isNullable = true, defaultValue = null) => {
  const enumList = enumValues.map(val => `'${val}'`).join(", ");
  const nullable = isNullable ? "NULL" : "NOT NULL";
  const defaultClause = defaultValue ? `DEFAULT '${defaultValue}'` : "";

  const alterQuery = `
    ALTER TABLE ${table} 
    MODIFY COLUMN ${column} ENUM(${enumList}) ${nullable} ${defaultClause}
  `;

  mysqlConnection.query(alterQuery, (err) => {
    if (err) {
      console.error(`❌ Error updating ENUM column ${column} in table ${table}:`, err);
    } else {
      console.log(`✅ ENUM column ${column} in table ${table} updated successfully.`);
    }
  });
};

// Function to iterate through all tables and ensure columns exist or delete columns
const createOrUpdateTables = async () => {
  tablesAndColumns.forEach(({ table, columnsToAdd, columnsToDelete }) => {
    // Ensure columns exist for each table
    if (Array.isArray(columnsToAdd)) {
      ensureColumnsExist(table, columnsToAdd);
    }

    // Delete columns for each table (only if columnsToDelete is defined)
    if (Array.isArray(columnsToDelete)) {
      deleteColumns(table, columnsToDelete);
    }

    // Rename 'packsize' to 'volume'
    renameColumn("sample", "packsize", "volume", "VARCHAR(255)");

    // Rename 'DateOfCollection' to 'DateOfSampling'
    renameColumn("sample", "DateOfCollection", "DateOfSampling", "VARCHAR(255)");

    // Rename 'samplename' to 'diseasename'
    renameColumn("sample", "samplename", "diseasename", "VARCHAR(255)");

    // RENAME sample_status TO sample_visibility
    renameColumn("sample", "sample_status", "sample_visibility", "ENUM('Public', 'Private') DEFAULT 'Private'");

    updateEnumColumn("collectionsitestaff", "permission", [
      "add_full",
      "add_basic",
      "edit",
      "dispatch",
      "receive",
      "all"
    ], true, "all");
    updateEnumColumn("sample", "sample_visibility", [
      "Public",
      "Non-Public",
    ], true, "Non-Public");
  });


  // await executeSequentially([
  //   () =>
  //     ensureColumnsExist("user_account", [
  //       { column: "OTP", type: "VARCHAR(4)", nullable: true },
  //       { column: "otpExpiry", type: "TIMESTAMP", nullable: true },
  //     ]),
  //   () =>
  //     updateEnumColumn("user_account", "accountType", [
  //       "Researcher",
  //       "Organization",
  //       "RegistrationAdmin",
  //       "TechnicalAdmin",
  //       "biobank",
  //       "Committeemember",
  //       "CSR"
  //     ]),
  //   () =>
  //     updateEnumColumn("organization", "status", [
  //       "pending",
  //       "active",
  //       "inactive"
  //     ]),
  //   () =>
  //     updateEnumColumn("csr", "status", [
  //       "pending",
  //       "active",
  //       "inactive"
  //     ]),
  //   () =>
  //     updateEnumColumn("committeesampleapproval", "committee_status", [
  //       "UnderReview",
  //       "Approved",
  //       "Refused",
  //     ]),
  // ]);
};

module.exports = {
  createOrUpdateTables,
};
