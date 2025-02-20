const mysqlConnection = require("../config/db");

// List of tables and their columns to be added or removed
const tablesAndColumns = [
  {
    table: "user_account",
    columnsToAdd: [
      { column: 'phone_number', type: 'VARCHAR(20)', nullable: true },
      { column: 'address', type: 'VARCHAR(255)', nullable: true }
    ],
    columnsToDelete: ['old_column_name'] // Add the columns you want to delete
  },
  {
    table: "sample",
    columnsToAdd: [
      { column: 'new_column', type: 'INT', nullable: false },
      { column: 'extra_field', type: 'TEXT', nullable: true }
    ],
    columnsToDelete: ['obsolete_column'] // Add the columns you want to delete
  },

];

// Function to check if column exists and add it if not
const ensureColumnsExist = (table, columns) => {
  columns.forEach(({ column, type, nullable }) => {
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

      if (results[0].count === 0) {
        const alterTableQuery = `ALTER TABLE ${table} ADD COLUMN ${column} ${type} ${nullable ? 'NULL' : 'NOT NULL'}`;
        
        mysqlConnection.query(alterTableQuery, (err) => {
          if (err) {
            console.error(`Error adding column ${column} to table ${table}: `, err);
          } else {
            console.log(`Column ${column} added successfully to table ${table}.`);
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
    
    // Delete columns for each table
    deleteColumns(table, columnsToDelete);
  });
};

module.exports = { 
    createOrUpdateTables
};