const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");

// Function to create the SampleFields table


const create_AnalyteTable = () => {
  const AnalyteTable = `
  CREATE TABLE IF NOT EXISTS analyte (
    id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      testresultunit_id INT,
      image VARCHAR(500) DEFAULT NULL,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE,
      FOREIGN KEY (testresultunit) REFERENCES testresultunit(id) ON DELETE CASCADE
)`;
  mysqlConnection.query(AnalyteTable, (err, result) => {
    if (err) {
      console.error("Error creating Analyte table: ", err);
    } else {
      console.log("Analyte table created Successfully");
    }
  });
};
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

// Function to create the VolumeUnit table
const createVolumeUnitTable = () => {
  const createVolumeUnitTable = `
    CREATE TABLE IF NOT EXISTS volumeunit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(createVolumeUnitTable, (err, results) => {
    if (err) {
      console.error("Error creating Volume Unit table: ", err);
    } else {
      console.log("Volume Unit table created Successfully");
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

const getAnalyteName=(callback)=>{
 const query = `SELECT 
    analyte.*,
    testresultunit.id AS testresultunit_id,
    testresultunit.name AS testresultunit
  FROM 
    analyte
  LEFT JOIN 
    testresultunit 
  ON 
    analyte.testresultunit_id = testresultunit.id
  WHERE 
    analyte.status = 'active'`;

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

const createAnalyte = (tableName,data, callback) => {
  const { bulkData, name, added_by, testresultunit_id, image } = data || {};

  if (!added_by) {
    return callback(new Error("Missing 'added_by' field."));
  }

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      try {
        // ✅ BULK INSERT: only `name` is required
        if (bulkData && Array.isArray(bulkData) && bulkData.length > 0) {
          const uniqueNames = Array.from(
            new Set(
              bulkData
                .map((item) => (typeof item.name === "string" ? item.name.trim() : null))
                .filter((name) => !!name)
            )
          );

          if (uniqueNames.length === 0) {
            throw new Error("No valid analyte names provided in bulk.");
          }

          const insertValues = uniqueNames.map((name) => [name, added_by]);

          const insertQuery = `
            INSERT IGNORE INTO analyte (name, added_by)
            VALUES ?
          `;
          await connection.promise().query(insertQuery, [insertValues]);

          const [rows] = await connection.promise().query(
            `SELECT id, name FROM analyte WHERE name IN (?)`,
            [uniqueNames]
          );

          const historyValues = rows.map(({ id, name }) => [name, added_by, id, "active"]);

          const historyQuery = `
            INSERT INTO registrationadmin_history
            (created_name, added_by, analyte_id, status)
            VALUES ?
          `;
          await connection.promise().query(historyQuery, [historyValues]);
        }

        // ✅ SINGLE INSERT: name, added_by, testresultunit_id are required
        else if (name && added_by ) {
          const safeImage = typeof image === "string" && image.length > 0 ? image : null;

          const insertQuery = `
            INSERT INTO analyte (name, added_by, testresultunit_id, image)
            VALUES (?, ?, ?, ?);
          `;
          const [result] = await connection.promise().query(
            insertQuery,
            [name.trim(), added_by, testresultunit_id, safeImage]
          );

          const historyQuery = `
            INSERT INTO registrationadmin_history
            (created_name, added_by, analyte_id, status)
            VALUES (?, ?, ?, ?);
          `;
          await connection.promise().query(historyQuery, [name, added_by, result.insertId, "active"]);
        }

        // ❌ INVALID INPUT
        else {
          throw new Error("Invalid analyte data or missing required fields.");
        }

        connection.commit();
        callback(null, { success: true });
      } catch (err) {
        console.error("❌ Error during createAnalyte:", err.message, err.stack);
        connection.rollback();
        callback(err);
      } finally {
        connection.release();
      }
    });
  });
};


// Function to create all SampleFields
const createSampleFields = (tableName, data, callback) => {
  const { bulkData, name, added_by } = data || {};

  if (!/^[a-zA-Z_]+$/.test(tableName)) return callback(new Error("Invalid table name"));

  mysqlPool.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      try {
        let values = [];

        if (bulkData && Array.isArray(bulkData) && bulkData.length > 0) {
          values = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);

          const insertQuery = `INSERT IGNORE INTO \`${tableName}\` (name, added_by) VALUES ?;`;
          await connection.promise().query(insertQuery, [values.map(({ name, added_by }) => [name, added_by])]);

          const [rows] = await connection.promise().query(
            `SELECT id, name FROM \`${tableName}\` WHERE name IN (?)`,
            [values.map(({ name }) => name)]
          );

          if (rows.length === 0) throw new Error("Failed to retrieve inserted IDs");

          const idColumn = `${tableName}_id`;
          const historyValues = rows.map(({ id, name }) => [name, added_by, id, "active"]);
          const historyQuery = `INSERT INTO registrationadmin_history (created_name, added_by, ${idColumn}, status) VALUES ?;`;
          await connection.promise().query(historyQuery, [historyValues]);
        } else if (name && added_by) {
          const insertQuery = `INSERT INTO \`${tableName}\` (name, added_by) VALUES (?, ?);`;
          const [result] = await connection.promise().query(insertQuery, [name, added_by]);

          const idColumn = `${tableName}_id`;
          const historyQuery = `
            INSERT INTO registrationadmin_history
            (created_name, added_by, ${idColumn}, status)
            VALUES (?, ?, ?, ?);
          `;
          await connection.promise().query(historyQuery, [name, added_by, result.insertId, "active"]);
        } else {
          throw new Error("Invalid data or missing required fields.");
        }

        connection.commit();
        callback(null, { success: true });
      } catch (err) {
        console.error("❌ Error during createSampleFields:", err.message, err.stack);
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
  const { name, added_by, testresultunit_id,image } = data;

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

    // Prepare dynamic update query
    let updateQuery = `UPDATE \`${tableName}\` SET name = ?, added_by = ?`;
    const updateParams = [name, added_by];

    // If table is analyte, also include testresultunit_id
    if (tableName === "analyte") {
  if (testresultunit_id) {
    updateQuery += `, testresultunit_id = ?`;
    updateParams.push(testresultunit_id);
  }
if (image) {
  updateQuery += `, image = ?`;
  updateParams.push(image);
}

}


    updateQuery += ` WHERE id = ?`;
    updateParams.push(id);

    mysqlConnection.query(updateQuery, updateParams, (err, result) => {
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
  create_AnalyteTable,
  create_infectiousdiseaseTable,
  createEthnicityTable,
  createSampleConditionTable,
  createSamplePriceCurrencyTable,
  createStorageTemperatureTable,
  createContainerTypeTable,
  createVolumeUnitTable,
  createSampleTypeMatrixTable,
  createTestMethodTable,
  createTestResultUnitTable,
  createConcurrentMedicalConditionsTable,
  createTestKitManufacturerTable,
  createTestSystemTable,
  createTestSystemManufacturerTable,
  getAnalyteName,
  createAnalyte
};
