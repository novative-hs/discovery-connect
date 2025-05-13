const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");
// Function to create the SampleFields table
const createEthnicityTable = () => {
  const createEthnicityTable = `
    CREATE TABLE IF NOT EXISTS ethnicity (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;
  mysqlConnection.query(createEthnicityTable, (err, results) => {
    if (err) {
      console.error("Error creating Ethnicity table: ", err);
    } else {
      console.log("Ethnicity table created Successfully");
    }
  });
};

const createSampleConditionTable = () => {
  const createsampleconditionTable = `
    CREATE TABLE IF NOT EXISTS samplecondition (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createsampleconditionTable, (err, results) => {
    if (err) {
      console.error("Error creating Sample Condition table: ", err);
    } else {
      console.log("Sample Condition table created Successfully");
    }
  });
};

const createSamplePriceCurrencyTable = () => {
  const createsamplepricecurrencyTable = `
    CREATE TABLE IF NOT EXISTS samplepricecurrency (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createsamplepricecurrencyTable, (err, results) => {
    if (err) {
      console.error("Error creating Sample Price Currency table: ", err);
    } else {
      console.log("Sample Price Currency table created Successfully");
    }
  });
};

const createStorageTemperatureTable = () => {
  const createStorageTemperature = `
    CREATE TABLE IF NOT EXISTS storagetemperature(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createStorageTemperature, (err, results) => {
    if (err) {
      console.error("Error creating Storage Temperature table: ", err);
    } else {
      console.log("Storage Temperature table created Successfully");
    }
  });
};

// Function to create the containertype table
const createContainerTypeTable = () => {
  const createContainerTypeTable = `
    CREATE TABLE IF NOT EXISTS containertype (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createContainerTypeTable, (err, results) => {
    if (err) {
      console.error("Error creating Container Type table: ", err);
    } else {
      console.log("Container Type table created Successfully");
    }
  });
};

// Function to create the QuantityUnit table
const createQuantityUnitTable = () => {
  const createQuantityUnitTable = `
    CREATE TABLE IF NOT EXISTS quantityunit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createQuantityUnitTable, (err, results) => {
    if (err) {
      console.error("Error creating Quantity Unit table: ", err);
    } else {
      console.log("Quantity Unit table created Successfully");
    }
  });
};

// Function to create the SampleTypeMatrix table
const createSampleTypeMatrixTable = () => {
  const createSampleTypeMatrixTable = `
    CREATE TABLE IF NOT EXISTS sampletypematrix (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createSampleTypeMatrixTable, (err, results) => {
    if (err) {
      console.error("Error creating Sample Type Matrix table: ", err);
    } else {
      console.log("Sample Type Matrix table created Successfully");
    }
  });
};

// Function to create the Test Method table
const createTestMethodTable = () => {
  const createTestMethodTable = `
    CREATE TABLE IF NOT EXISTS testmethod (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createTestMethodTable, (err, results) => {
    if (err) {
      console.error("Error creating Test Method table: ", err);
    } else {
      console.log("Test Method table created Successfully");
    }
  });
};

const createTestResultUnitTable = () => {
  const createTestResultUnitTable = `
    CREATE TABLE IF NOT EXISTS testresultunit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createTestResultUnitTable, (err, results) => {
    if (err) {
      console.error("Error creating Test ResultUnit table: ", err);
    } else {
      console.log("Test ResultUnit table created Successfully");
    }
  });
};

// Function to create the concurrentmedicalconditions table
const createConcurrentMedicalConditionsTable = () => {
  const createConcurrentMedicalConditionsTable = `
    CREATE TABLE IF NOT EXISTS concurrentmedicalconditions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(
    createConcurrentMedicalConditionsTable,
    (err, results) => {
      if (err) {
        console.error(
          "Error creating Concurrent Medical Conditions table: ",
          err
        );
      } else {
        console.log("Concurrent Medical Conditions table created Successfully");
      }
    }
  );
};

// Function to create the Test Kit Manufacturer table
const createTestKitManufacturerTable = () => {
  const createtestkitmanufacturer = `
    CREATE TABLE IF NOT EXISTS testkitmanufacturer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;
  mysqlConnection.query(createtestkitmanufacturer, (err, results) => {
    if (err) {
      console.error("Error creating Test Kit Manufacturer table: ", err);
    } else {
      console.log("Test Kit Manufacturer table created Successfully");
    }
  });
};

const createTestSystemTable = () => {
  const createTestSystem = `
    CREATE TABLE IF NOT EXISTS testsystem (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;
  mysqlConnection.query(createTestSystem, (err, results) => {
    if (err) {
      console.error("Error creating Test System table: ", err);
    } else {
      console.log("Test System table created Successfully");
    }
  });
};

const createTestSystemManufacturerTable = () => {
  const createTestSystemManufacturerTable = `
    CREATE TABLE IF NOT EXISTS testsystemmanufacturer (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;
  mysqlConnection.query(createTestSystemManufacturerTable, (err, results) => {
    if (err) {
      console.error("Error creating Test System Manufacturer table: ", err);
    } else {
      console.log("Test System Manufacturer table created Successfully");
    }
  });
};

// Function to get all SampleFields
const getAllSampleFields = (tableName, callback) => {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return callback(new Error("Invalid table name"), null);
  }

  const query = `SELECT * FROM \`${tableName}\` WHERE status = "active"`;
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Function to create all SampleFields
const createSampleFields = (tableName, data, callback) => {
  const { bulkData, name, added_by } = data || {};
  if (!/^[a-zA-Z_]+$/.test(tableName)) return callback(new Error("Invalid table name"));

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction(async (err) => {
      if (err) return connection.release(), callback(err);

      try {
        let values = [];

        if (bulkData && Array.isArray(bulkData) && bulkData.length > 0) {
          values = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
        } else if (name && added_by) {
          values = [{ name, added_by }];
        } else {
          throw new Error("Invalid data");
        }

        // Insert unique values
        const insertQuery = `INSERT IGNORE INTO \`${tableName}\` (name, added_by) VALUES ?;`;
        await connection.promise().query(insertQuery, [values.map(({ name, added_by }) => [name, added_by])]);

        // Fetch inserted IDs
        const [rows] = await connection.promise().query(
          `SELECT id, name FROM \`${tableName}\` WHERE name IN (?)`,
          [values.map(({ name }) => name)]
        );

        if (rows.length === 0) throw new Error("Failed to retrieve inserted IDs");

        // Insert history
        const idColumn = `${tableName}_id`;
        const historyValues = rows.map(({ id, name }) => [name, added_by, id, "active"]);
        const historyQuery = `INSERT INTO registrationadmin_history (created_name, added_by, ${idColumn}, status) VALUES ?;`;
        await connection.promise().query(historyQuery, [historyValues]);

        connection.commit();
        callback(null, { success: true });
      } catch (err) {
        connection.rollback();
        callback(err);
      } finally {
        connection.release();
      }
    });
  });
};

// Function to update a record dynamically
const updateSampleFields = (tableName, id, data, callback) => {
  const { name, added_by } = data;

  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return callback(new Error("Invalid table name"), null);
  }

  const fetchQuery = `SELECT name FROM \`${tableName}\` WHERE id = ?`;
  mysqlConnection.query(fetchQuery, [id], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0)
      return callback(new Error("Record not found"), null);

    const oldName = results[0].name;
    const idColumn = `${tableName}_id`;

    const updateQuery = `
      UPDATE \`${tableName}\`
      SET name = ?, added_by = ?
      WHERE id = ?
    `;

    mysqlConnection.query(updateQuery, [name, added_by, id], (err, result) => {
      if (err) return callback(err, null);

      const updateHistoryQuery = `
        UPDATE registrationadmin_history
        SET created_name = ?, updated_name = ?, added_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE ${idColumn} = ?
      `;

      mysqlConnection.query(
        updateHistoryQuery,
        [oldName, name, added_by, id],
        (err, historyResult) => {
          if (err) return callback(err, null);
          callback(null, { result, historyResult });
        }
      );
    });
  });
};

// Function to delete (soft delete) a record dynamically
const deleteSampleFields = (tableName, id, callback) => {
  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return callback(new Error("Invalid table name"), null);
  }

  const query = `UPDATE \`${tableName}\` SET status = "inactive" WHERE id = ?`;
  mysqlConnection.query(query, [id], (err, result) => {
    if (err) return callback(err, null);

    const idColumn = `${tableName}_id`;

    const updateHistoryStatusQuery = `
      UPDATE registrationadmin_history
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE ${idColumn} = ?
    `;

    mysqlConnection.query(
      updateHistoryStatusQuery,
      [id],
      (err, historyResult) => {
        if (err) return callback(err, null);
        callback(null, { result, historyResult });
      }
    );
  });
};

// Function to GET sample field names
const getSampleFieldsNames = (tableName, callback) => {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_]+$/.test(tableName)) {
    return callback(new Error("Invalid table name"), null);
  }

  // Query to fetch names from the given table
  const query = `SELECT name FROM \`${tableName}\` WHERE status = 'active'`;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error(`SQL Error (${tableName}):`, err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllSampleFields,
  updateSampleFields,
  createSampleFields,
  deleteSampleFields,
  getSampleFieldsNames,
  createEthnicityTable,
  createSampleConditionTable,
  createSamplePriceCurrencyTable,
  createStorageTemperatureTable,
  createContainerTypeTable,
  createQuantityUnitTable,
  createSampleTypeMatrixTable,
  createTestMethodTable,
  createTestResultUnitTable,
  createConcurrentMedicalConditionsTable,
  createTestKitManufacturerTable,
  createTestSystemTable,
  createTestSystemManufacturerTable,
};
