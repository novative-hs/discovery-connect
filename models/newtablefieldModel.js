const mysqlConnection = require("../config/db");

// List of tables and their columns to be added or removed
const tablesAndColumns = [
  {

    table: "researcher",
    columnsToAdd: [
      { column: 'added_by', type: 'INT', nullable: true, references: { table: "user_account", column: "id" } },
      { column: 'created_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP' },
      { column: 'updated_at', type: 'TIMESTAMP', nullable: false, default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ]

  },
  {
    table: "registrationadmin_history",
    columnsToAdd: [
      { column: 'ethnicity_id', type: 'INT', nullable: true, references: { table: "ethnicity", column: "id" } },
      { column: 'samplecondition_id', type: 'INT', nullable: true, references: { table: "samplecondition", column: "id" } },
      { column: 'storagetemperature_id', type: 'INT', nullable: true, references: { table: "storagetemperature", column: "id" } },
      { column: 'containertype_id', type: 'INT', nullable: true, references: { table: "containertype", column: "id" } },
      { column: 'quantityunit_id', type: 'INT', nullable: true, references: { table: "quantityunit", column: "id" } },
      { column: 'sampletypematrix_id', type: 'INT', nullable: true, references: { table: "sampletypematrix", column: "id" } },
      { column: 'testmethod_id', type: 'INT', nullable: true, references: { table: "testmethod", column: "id" } },
      { column: 'testresultunit_id', type: 'INT', nullable: true, references: { table: "testresultunit", column: "id" } },
      { column: 'concurrentmedicalconditions_id', type: 'INT', nullable: true, references: { table: "concurrentmedicalconditions", column: "id" } },
      { column: 'testkitmanufacturer_id', type: 'INT', nullable: true, references: { table: "testkitmanufacturer", column: "id" } },
      { column: 'testsystem_id', type: 'INT', nullable: true, references: { table: "testsystem", column: "id" } },
      { column: 'testsystemmanufacturer_id', type: 'INT', nullable: true, references: { table: "testsystemmanufacturer", column: "id" } }
    ]
  },
  {
    table: "registrationadmin_history",
    columnsToDelete: ['status'],
    columnsToAdd: [
      {
        column: 'status',
        type: `ENUM('active', 'inactive', 'unapproved', 'approved', 'pending')`,
        nullable: false,
        default: 'active'
      }
    ]

  },
];

// Function to check if column exists and add it if not
const ensureColumnsExist = (table, columns) => {
  columns.forEach(({ column, type, nullable, default: defaultValue, references }) => {
    const checkColumnQuery = `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = '${table}' AND column_name = '${column}' AND table_schema = DATABASE()
    `;

    mysqlConnection.query(checkColumnQuery, (err, results) => {
      if (err) {
        console.error(`Error checking column ${column} in table ${table}:`, err);
        return;
      }

      if (results[0].count === 0) {
        let alterTableQuery = `ALTER TABLE ${table} ADD COLUMN ${column} ${type} ${nullable ? 'NULL' : 'NOT NULL'}`;

        // Only add DEFAULT if a default value is explicitly provided
        if (defaultValue !== undefined) {
          if (type.startsWith('ENUM')) {
            // Wrap ENUM default value in quotes
            alterTableQuery += ` DEFAULT '${defaultValue}'`;
          } else {
            alterTableQuery += ` DEFAULT ${defaultValue}`;
          }
        }

        mysqlConnection.query(alterTableQuery, (err) => {
          if (err) {
            console.error(`Error adding column ${column} to table ${table}:`, err);
          } else {
            console.log(`Column ${column} added successfully to table ${table}.`);

            // If the column has a foreign key reference, add the constraint
            if (references) {
              const fkName = `fk_${table}_${column}`;
              const addForeignKeyQuery = `
                ALTER TABLE ${table} 
                ADD CONSTRAINT ${fkName} 
                FOREIGN KEY (${column}) REFERENCES ${references.table}(${references.column}) 
                ON DELETE SET NULL
              `;

              mysqlConnection.query(addForeignKeyQuery, (err) => {
                if (err) {
                  console.error(`Error adding foreign key ${fkName} on ${table}.${column}:`, err);
                } else {
                  console.log(`Foreign key ${fkName} added successfully on ${table}.${column}.`);
                }
              });
            }
          }
        });
      } else {
        console.log(`Column ${column} already exists in table ${table}.`);
      }
    });
  });
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
        console.error(`Error checking column ${column} in table ${table}: `, err);
        return;
      }

      if (results[0].count > 0) {
        const alterTableQuery = `ALTER TABLE ${table} DROP COLUMN ${column}`;

        mysqlConnection.query(alterTableQuery, (err) => {
          if (err) {
            console.error(`Error deleting column ${column} from table ${table}: `, err);
          } else {
            console.log(`Column ${column} deleted successfully from table ${table}.`);
          }
        });
      } else {
        console.log(`Column ${column} does not exist in table ${table}.`);
      }
    });
  });
};

// Function to iterate through all tables and ensure columns exist or delete columns
const createOrUpdateTables = () => {
  tablesAndColumns.forEach(({ table, columnsToAdd, columnsToDelete }) => {
    // Ensure columns exist for each table
    ensureColumnsExist(table, columnsToAdd);

    // Delete columns for each table (only if columnsToDelete is defined)
    if (columnsToDelete && columnsToDelete.length > 0) {
      deleteColumns(table, columnsToDelete);
    }
  });
};


module.exports = {
  createOrUpdateTables
};