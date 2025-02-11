const mysqlConnection = require("../config/db");

                                                    // ETHNICITY
// Function to create the Ethnicity table
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
// Function to get all Ethnicity
const getAllEthnicity = (callback) => {
  const query = 'SELECT * FROM ethnicity WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
// Function to create all Ethnicity
const createEthnicity = (data, callback, res) => {
  console.log('Received Request Body:', data); 

  const { bulkData, ethnicityname, added_by } = data || {};

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO ethnicity (name, added_by)
      VALUES ?
      ON DUPLICATE KEY UPDATE name = name;
    `;
    mysqlConnection.query(query, [values], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        console.log("Insert Result:", result); // Debugging result
        callback(null, result);
      }
    });
  } else if (ethnicityname && added_by) {
    const query = `
      INSERT INTO ethnicity (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;
    mysqlConnection.query(query, [ethnicityname, added_by], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  } else {
    callback(new Error('Invalid data'), null);
  }
};
// Function to update a Ethnicity 
const updateEthnicity = (id, data, callback) => {
  const { ethnicityname, added_by } = data;
  const query = `
    UPDATE ethnicity
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [ethnicityname, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};
// Function to delete a Ethnicity 
const deleteEthnicity = (id, callback) => {
  const query = 'UPDATE ethnicity SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};
// Function to GET ethnicity names
const getEthnicityNames = (callback) => {
  // Query to fetch ethnicity data
  const EthnicityQuery = `SELECT name FROM ethnicity `;
  mysqlConnection.query(EthnicityQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (ethnicity):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // SAMPLE CONDITION
// Function to create the SampleCondition table
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
  // Function to get all SampleCondition 
  const getAllSampleCondition = (callback) => {
    const query = 'SELECT * FROM samplecondition WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };  
  const createSampleCondition = (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, sampleconditionname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO samplecondition (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (sampleconditionname && added_by) {
      const query = `
        INSERT INTO samplecondition (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [sampleconditionname, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };
  // Function to update a samplecondition 
  const updateSampleCondition = (id, data, callback) => {
    const { sampleconditionname, added_by } = data;
    const query = `
      UPDATE samplecondition
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [sampleconditionname, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };
  // Function to delete a SampleCondition 
  const deleteSampleCondition = (id, callback) => {
    const query = 'UPDATE samplecondition SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET SampleCondition names
const getSampleConditionNames = (callback) => {
  // Query to fetch SampleCondition data
  const SampleConditionQuery = `SELECT name FROM samplecondition `;
  mysqlConnection.query(SampleConditionQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (ethnicity):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                      // STORAGE TEMPERATURE
// Function to create the Storage Temperature table
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
  // Function to get all Sample Temperature
  const getAllStorageTemperature = (callback) => {
    const query = 'SELECT * FROM storagetemperature WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  // Function to create Sample Temperature
  const createStorageTemperature = (data, callback, res) => {
    console.log("Received Request Body:", data);
  
    const { bulkData, storagetemperaturename, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(
        JSON.parse
      );
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO storagetemperature (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (storagetemperaturename && added_by) {
      const query = `
        INSERT INTO storagetemperature (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(
        query,
        [storagetemperaturename, added_by],
        (err, result) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, result);
          }
        }
      );
    } else {
      callback(new Error("Invalid data"), null);
    }
  };
  // Function to update a Sample Temperature
  const updateStorageTemperature = (id, data, callback) => {
    const { storagetemperaturename, added_by } = data;
    const query = `
      UPDATE storagetemperature
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(
      query,
      [storagetemperaturename, added_by, id],
      (err, result) => {
        if (err) {
          console.error("Error in query:", err); // Log the error to debug
          callback(err, result);
        } else {
          callback(null, result);
        }
      }
    );
  };
  // Function to delete a Storage temperature
  const deleteStorageTemperature = (id, callback) => {
    const query = 'UPDATE storagetemperature SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
// Function to GET storage temperature names
const getStorageTemperatureNames = (callback) => {
  // Query to fetch StorageTemperature data
  const StorageTemperatureQuery = `SELECT name FROM storagetemperature `;
  mysqlConnection.query(StorageTemperatureQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (StorageTemperature):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                        // CONTAINER TYPE 
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
  // Function to get all ContainerType
  const getAllContainerType = (callback) => {
    const query = 'SELECT * FROM containertype WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };  
  const createContainerType = (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, containertypename, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO containertype (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (containertypename && added_by) {
      const query = `
        INSERT INTO containertype (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [containertypename, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };  
  // Function to update a ContainerType 
  const updateContainerType = (id, data, callback) => {
    const { containertypename, added_by } = data;
    const query = `
      UPDATE containertype
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [containertypename, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };  
  // Function to delete a ContainerType 
  const deleteContainerType = (id, callback) => {
    const query = 'UPDATE containertype SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET ContainerType names
const getContainerTypeNames = (callback) => {
  // Query to fetch ContainerType data
  const ContainerTypeQuery = `SELECT name FROM containertype `;
  mysqlConnection.query(ContainerTypeQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (ContainerType):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                // QUANTITY UNIT
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
  // Function to get all QuantityUnit 
  const getAllQuantityUnit = (callback) => {
    const query = 'SELECT * FROM quantityunit WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };  
  const createQuantityUnit= (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, quantityunitname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO quantityunit (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (quantityunitname && added_by) {
      const query = `
        INSERT INTO quantityunit (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [quantityunitname, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };  
  // Function to update a QuantityUnit 
  const updatequantityunit = (id, data, callback) => {
    const { quantityunitname, added_by } = data;
    const query = `
      UPDATE quantityunit
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [quantityunitname, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  }; 
  // Function to delete a QuantityUnit 
  const deleteQuantityUnit = (id, callback) => {
    const query = 'UPDATE quantityunit SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET QuantityUnit names
const getQuantityUnitNames = (callback) => {
  // Query to fetch QuantityUnit data
  const QuantityUnitQuery = `SELECT name FROM quantityunit `;
  mysqlConnection.query(QuantityUnitQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (QuantityUnit):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // SAMPLE TYPE MATRIX
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
  // Function to get all SampleTypeMatrix
  const getAllSampleTypeMatrix = (callback) => {
    const query = 'SELECT * FROM sampletypematrix WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  const createSampleTypeMatrix = (data, callback, res) => {
    console.log("Received Request Body:", data);
  
    const { bulkData, sampletypematrixname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(
        JSON.parse
      );
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO sampletypematrix (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (sampletypematrixname && added_by) {
      const query = `
        INSERT INTO sampletypematrix (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(
        query,
        [sampletypematrixname, added_by],
        (err, result) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, result);
          }
        }
      );
    } else {
      callback(new Error("Invalid data"), null);
    }
  };
  // Function to update a SampleTypeMatrix
  const updateSampleTypeMatrix = (id, data, callback) => {
    const { sampletypematrixname, added_by } = data;
    const query = `
      UPDATE sampletypematrix
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(
      query,
      [sampletypematrixname, added_by, id],
      (err, result) => {
        if (err) {
          console.error("Error in query:", err); // Log the error to debug
          callback(err, result);
        } else {
          callback(null, result);
        }
      }
    );
  };
  // Function to delete a SampleTypeMatrix
  const deleteSampleTypeMatrix = (id, callback) => {
    const query = 'UPDATE sampletypematrix SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET SampleTypeMatrix names
const getSampleTypeMatrixNames = (callback) => {
  // Query to fetch SampleTypeMatrix data
  const SampleTypeMatrixQuery = `SELECT name FROM sampletypematrix `;
  mysqlConnection.query(SampleTypeMatrixQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (SampleTypeMatrix):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // TEST METHOD
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
  // Function to get all Test Method
  const getAllTestMethod = (callback) => {
    const query = 'SELECT * FROM testmethod WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
 // Function to create a Test Method
  const createTestMethod= (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, testmethodname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO testmethod (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (testmethodname && added_by) {
      const query = `
        INSERT INTO testmethod(name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [testmethodname, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };
  // Function to update a Test Method
  const updateTestMethod = (id, data, callback) => {
    const { testmethodname, added_by } = data;
    const query = `
      UPDATE testmethod
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [testmethodname, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };  
  // Function to delete a Test Method
  const deleteTestMethod= (id, callback) => {
    const query = 'UPDATE testmethod SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET TestMethod names
const getTestMethodNames = (callback) => {
  // Query to fetch TestMethod data
  const TestMethodQuery = `SELECT name FROM testmethod `;
  mysqlConnection.query(TestMethodQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (TestMethod):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // TEST RESULT UNIT
// Function to create the Test ResultUnit table
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
  // Function to get all Test ResultUnit
  const getAllTestResultUnit = (callback) => {
    const query = 'SELECT * FROM testresultunit WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  }; 
  // Function to create a Test ResultUnit
  const createTestResultUnit= (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, testresultunitname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO testresultunit (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (testresultunitname && added_by) {
      const query = `
        INSERT INTO testresultunit (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [testresultunitname, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };
  // Function to update a Test ResultUnit
  const updateTestResultUnit = (id, data, callback) => {
    const { testresultunitname, added_by } = data;
    const query = `
      UPDATE testresultunit
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [testresultunitname, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };
  // Function to delete a TestResultUnit
  const deleteTestResultUnit= (id, callback) => {
    const query = 'UPDATE testresultunit SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET TestResultUnit names
const getTestResultUnitNames = (callback) => {
  // Query to fetch TestResultUnit data
  const TestResultUnitQuery = `SELECT name FROM testresultunit `;
  mysqlConnection.query(TestResultUnitQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (TestResultUnit):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // CONCURRENT MEDICAL CONDITIONS
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
  
  
    mysqlConnection.query(createConcurrentMedicalConditionsTable, (err, results) => {
      if (err) {
        console.error("Error creating Concurrent Medical Conditions table: ", err);
      } else {
        console.log("Concurrent Medical Conditions table created Successfully");
      }
    });
  };
  // Function to get all concurrentmedicalconditions 
  const getAllConcurrentMedicalConditions = (callback) => {
    const query = 'SELECT * FROM concurrentmedicalconditions WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  const createConcurrentMedicalConditions = (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, concurrentmedicalname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO concurrentmedicalconditions (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
  
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (concurrentmedicalname && added_by) {
      const query = `
        INSERT INTO concurrentmedicalconditions (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
      mysqlConnection.query(query, [concurrentmedicalname, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };
  // Function to update a concurrentmedicalconditions
  const updateConcurrentMedicalConditions = (id, data, callback) => {
    const { concurrentmedicalname, added_by } = data;
    const query = `
      UPDATE concurrentmedicalconditions
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [concurrentmedicalname, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };
  // Function to delete a concurrentmedicalconditions
  const deleteConcurrentMedicalConditions = (id, callback) => {
    const query = 'UPDATE concurrentmedicalconditions SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
  // Function to GET ConcurrentMedicalConditions names
const getConcurrentMedicalConditionsNames = (callback) => {
  // Query to fetch ConcurrentMedicalConditions data
  const ConcurrentMedicalConditionsQuery = `SELECT name FROM concurrentmedicalconditions `;
  mysqlConnection.query(ConcurrentMedicalConditionsQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (ConcurrentMedicalConditions):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // TEST KIT MANUFACTURER
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
  // Function to get all Test Kit Manufacturer
  const getAllTestKitManufacturer = (callback) => {
    const query = 'SELECT * FROM testkitmanufacturer WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  // Function to create Test Kit Manufacturer
  const createTestKitManufacturer= (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, testkitmanufacturername, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO testkitmanufacturer (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (testkitmanufacturername && added_by) {
      const query = `
        INSERT INTO testkitmanufacturer (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
      mysqlConnection.query(query, [testkitmanufacturername, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };
  // Function to update a Test Kit Manufacturer
  const updateTestKitManufacturer = (id, data, callback) => {
    const { testkitmanufacturername, added_by } = data;
    const query = `
      UPDATE testkitmanufacturer
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [testkitmanufacturername, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };
  // Function to delete a Test Kit Manufacturer
  const deleteTestKitManufacturer= (id, callback) => {
    const query = 'UPDATE testkitmanufacturer SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
 // Function to GET TestKitManufacturer names
const getTestKitManufacturerNames = (callback) => {
  // Query to fetch TestKitManufacturer data
  const TestKitManufacturerQuery = `SELECT name FROM testkitmanufacturer `;
  mysqlConnection.query(TestKitManufacturerQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (TestKitManufacturer):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};
  
                                                    // TEST SYSTEM
// Function to create the TestSystem table
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
  // Function to get all TestSystem
  const getAllTestSystem = (callback) => {
    const query = 'SELECT * FROM testsystem WHERE status = "active"';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  // Function to create all TestSystem
  const createTestSystem = (data, callback, res) => {
    console.log('Received Request Body:', data); 
  
    const { bulkData, testsystemname, added_by } = data || {};
  
    if (bulkData) {
      const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
      const values = uniqueData.map(({ name, added_by }) => [name, added_by]);
  
      // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
      const query = `
        INSERT INTO testsystem (name, added_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE name = name;
      `;
      mysqlConnection.query(query, [values], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("Insert Result:", result); // Debugging result
          callback(null, result);
        }
      });
    } else if (testsystemname && added_by) {
      const query = `
        INSERT INTO testsystem (name, added_by)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE name = name;
      `;
      mysqlConnection.query(query, [testsystemname, added_by], (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(new Error('Invalid data'), null);
    }
  };
  // Function to update a TestSystem 
  const updateTestSystem = (id, data, callback) => {
    const { testsystemname, added_by } = data;
    const query = `
      UPDATE testsystem
      SET name = ?, added_by = ?
      WHERE id = ?
    `;
    mysqlConnection.query(query, [testsystemname, added_by, id], (err, result) => {
      if (err) {
        console.error("Error in query:", err); // Log the error to debug
        callback(err, result);
      } else {
        callback(null, result);
      }
    });
  };
  // Function to delete a TestSystem 
  const deleteTestSystem= (id, callback) => {
    const query = 'UPDATE testsystem SET status = "inactive" WHERE id = ?';
    mysqlConnection.query(query, [id], (err, result) => {
      callback(err, result);
    });
  };
 // Function to GET TestSystem names
 const getTestSystemNames = (callback) => {
  // Query to fetch TestSystem data
  const TestSystemQuery = `SELECT name FROM testsystem `;
  mysqlConnection.query(TestSystemQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (TestSystem):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};

                                                    // TEST SYSTEM MANUFACTURER
// Function to create the TestSystem table
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
// Function to get all TestSystem Manufacturer
const getAllTestSystemManufacturer = (callback) => {
  const query = 'SELECT * FROM testsystemmanufacturer WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
// Function to create TestSystem Manufacturer
const createTestSystemManufacturer = (data, callback, res) => {
  console.log('Received Request Body:', data); 

  const { bulkData, testsystemmanufacturername, added_by } = data || {};

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO testsystemmanufacturer (name, added_by)
      VALUES ?
      ON DUPLICATE KEY UPDATE name = name;
    `;
    mysqlConnection.query(query, [values], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        console.log("Insert Result:", result); // Debugging result
        callback(null, result);
      }
    });
  } else if (testsystemmanufacturername && added_by) {
    const query = `
      INSERT INTO testsystemmanufacturer (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;
    mysqlConnection.query(query, [testsystemmanufacturername, added_by], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  } else {
    callback(new Error('Invalid data'), null);
  }
};
// Function to update a Test System Manufacturer
const updateTestSystemManufacturer = (id, data, callback) => {
  const { testsystemmanufacturername, added_by } = data;
  const query = `
    UPDATE testsystemmanufacturer
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [testsystemmanufacturername, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};
// Function to delete a Test System Manufacturer
const deleteTestSystemManufacturer= (id, callback) => {
  const query = 'UPDATE testsystemmanufacturer SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};
 // Function to GET TestSystemManufacturer names
 const getTestSystemManufacturerNames = (callback) => {
  // Query to fetch TestSystemManufacturer data
  const TestSystemManufacturerQuery = `SELECT name FROM testsystemmanufacturer `;
  mysqlConnection.query(TestSystemManufacturerQuery, (err, results) => {
    if (err) {
      console.error('SQL Error (TestSystemManufacturer):', err);
      callback(err, null);
      return;
    }
      callback(null, results);
      });
};


module.exports = {
  createEthnicityTable, getAllEthnicity, updateEthnicity, createEthnicity, deleteEthnicity, getEthnicityNames,

  createSampleConditionTable, getAllSampleCondition, updateSampleCondition, createSampleCondition, deleteSampleCondition, getSampleConditionNames,

  createStorageTemperature, createStorageTemperatureTable, getAllStorageTemperature, updateStorageTemperature, deleteStorageTemperature, getStorageTemperatureNames,

  createContainerTypeTable, getAllContainerType, updateContainerType, createContainerType, deleteContainerType, getContainerTypeNames,

  createQuantityUnitTable, getAllQuantityUnit, updatequantityunit, createQuantityUnit, deleteQuantityUnit, getQuantityUnitNames,

  createSampleTypeMatrixTable, createSampleTypeMatrix, getAllSampleTypeMatrix, updateSampleTypeMatrix, createSampleTypeMatrix, deleteSampleTypeMatrix, getSampleTypeMatrixNames,

  createTestMethodTable, getAllTestMethod, updateTestMethod, createTestMethod, deleteTestMethod, getTestMethodNames,

  createTestResultUnitTable, getAllTestResultUnit, updateTestResultUnit, createTestResultUnit, deleteTestResultUnit, getTestResultUnitNames,

  createConcurrentMedicalConditionsTable, getAllConcurrentMedicalConditions, updateConcurrentMedicalConditions, createConcurrentMedicalConditions, deleteConcurrentMedicalConditions, getConcurrentMedicalConditionsNames,

  createTestKitManufacturerTable, getAllTestKitManufacturer, updateTestKitManufacturer, createTestKitManufacturer, deleteTestKitManufacturer, getTestKitManufacturerNames,

  createTestSystemTable, getAllTestSystem, updateTestSystem, createTestSystem, deleteTestSystem, getTestSystemNames,

  createTestSystemManufacturerTable, getAllTestSystemManufacturer, updateTestSystemManufacturer, createTestSystemManufacturer, deleteTestSystemManufacturer, getTestSystemManufacturerNames,
};