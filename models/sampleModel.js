const mysqlConnection = require("../config/db");
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
// Function to create the sample table
const createSampleTable = () => {
  const sampleTable = `
    CREATE TABLE IF NOT EXISTS sample (
        id VARCHAR(36) PRIMARY KEY,
        donorID VARCHAR(50),
        masterID VARCHAR(36),
        user_account_id INT,
        samplename VARCHAR(100),
        age INT,
        gender VARCHAR(10),
        ethnicity VARCHAR(50),
        samplecondition VARCHAR(100),
        storagetemp VARCHAR(255),
        ContainerType VARCHAR(50),
        CountryOfCollection VARCHAR(50),
        price FLOAT,
        SamplePriceCurrency VARCHAR(255),
        quantity FLOAT,
        QuantityUnit VARCHAR(20),
        SampleTypeMatrix VARCHAR(100),
        SmokingStatus VARCHAR(50),
        AlcoholOrDrugAbuse VARCHAR(50),
        InfectiousDiseaseTesting VARCHAR(100),
        InfectiousDiseaseResult VARCHAR(100),
        FreezeThawCycles VARCHAR(50), 
        DateOfCollection VARCHAR(50),
        ConcurrentMedicalConditions VARCHAR(50), 
        ConcurrentMedications VARCHAR(50),
        DiagnosisTestParameter VARCHAR(50),
        TestResult VARCHAR(100),
        TestResultUnit VARCHAR(20),
        TestMethod VARCHAR(100),
        TestKitManufacturer VARCHAR(50),
        TestSystem VARCHAR(50),
        TestSystemManufacturer VARCHAR(50),
        status VARCHAR(20) DEFAULT 'In Stock',
        logo LONGBLOB,
        is_deleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  mysqlConnection.query(sampleTable, (err, results) => {
    if (err) {
      console.error("Error creating sample table: ", err);
    } else {
      console.log("Sample table created or already exists");
    }
  });
};

// Function to get all samples with 'In Stock' status
const getSamples = (id, callback) => {
  // Validate and parse `id`
  const user_account_id = parseInt(id);
  if (isNaN(user_account_id)) {
    console.error("Invalid user_account_id:", id);
    return callback(new Error("Invalid user_account_id"), null);
  }

  const query = `
    SELECT s.*
    FROM sample s
    JOIN user_account ua ON s.user_account_id = ua.id
    WHERE s.status = "In Stock" 
      AND s.is_deleted = FALSE
      AND ua.accountType = "CollectionSites"
      AND s.user_account_id = ?;
  `;
  mysqlConnection.query(query, [user_account_id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

const getAllSamples = (callback) => {
  const query = `
SELECT 
  s.*,
  cs.CollectionSiteName AS Name,
  bb.Name AS Name,
  c.name AS CityName,
  d.name AS DistrictName
FROM 
  sample s
LEFT JOIN 
  collectionsite cs ON s.user_account_id = cs.user_account_id
LEFT JOIN 
  biobank bb ON s.user_account_id = bb.id
LEFT JOIN 
  city c ON cs.city = c.id
LEFT JOIN 
  district d ON cs.district = d.id
WHERE 
  s.status = 'In Stock' and s.price > 0;

  `;

  // Log query being executed
  console.log("Executing Query:", query);

  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      callback(err, null); // Will send 500 if there's an error with the query
      return;
    }

    // Log results
    console.log("DB Query Results:", results);

    // Continue with image processing
    const imageFolder = path.join(__dirname, '../uploads/Images');
    fs.readdir(imageFolder, (fsErr, files) => {
      if (fsErr) {
        console.error("Error reading image folder:", fsErr);
        callback(fsErr, null);
        return;
      }

      console.log("Files in image folder:", files);
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      console.log("Filtered Image Files:", imageFiles);

      const updatedResults = results.map(sample => {
        if (imageFiles.length > 0) {
          const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
          const imagePath = path.join(imageFolder, randomImage);

          // Read the image file as binary data and convert to base64
          const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

          // Set the base64 encoded image in the sample object
          sample.imageUrl = `data:image/${path.extname(randomImage).slice(1)};base64,${base64Image}`;
        } else {
          sample.imageUrl = null;
        }
        return sample;
      });

      console.log("Updated Results with Images:", updatedResults);

      callback(null, updatedResults);
    });
  });
};

// Function to get a sample by its ID
const getSampleById = (id, callback) => {
  const query = 'SELECT * FROM sample WHERE id = ?';
  mysqlConnection.query(query, [id], (err, results) => {
    callback(err, results);
  });
};

// Function to create a new sample (Collectionsites will add samples)
const createSample = (data, callback) => {
  console.log("Inserting data into database:", data);

  const id = uuidv4(); // Generate a secure unique ID
  const masterID = uuidv4(); // Secure Master ID

  const query = `
    INSERT INTO sample (
      id, donorID, user_account_id, samplename, age, gender, ethnicity, samplecondition, storagetemp, ContainerType, CountryOfCollection, quantity, QuantityUnit, SampleTypeMatrix, SmokingStatus, AlcoholOrDrugAbuse, InfectiousDiseaseTesting, InfectiousDiseaseResult, FreezeThawCycles, DateOfCollection, ConcurrentMedicalConditions, ConcurrentMedications, DiagnosisTestParameter, TestResult, TestResultUnit, TestMethod, TestKitManufacturer, TestSystem, TestSystemManufacturer, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;  

  mysqlConnection.query(query, [
    id, data.donorID, data.user_account_id, data.samplename, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, 'In Stock'
  ], (err, results) => {
    if (err) {
      console.error('Error in MySQL query:', err);
      return callback(err, null);
    }

    console.log('Insert result:', results);

     // Now update masterID
     const updateQuery = `UPDATE sample SET masterID = ? WHERE id = ?`;
     mysqlConnection.query(updateQuery, [masterID, id], (err, updateResults) => {
       if (err) {
         console.error('Error updating masterID:', err);
         return callback(err, null);
       }
       console.log('Sample inserted successfully with masterID:', masterID);

      // Insert into sample_history
      const historyQuery = `
        INSERT INTO sample_history (sample_id) VALUES (?)`;
      
      mysqlConnection.query(historyQuery, [id], (err, historyResults) => {
        if (err) {
          console.error('Error inserting into sample_history:', err);
          return callback(err, null);
        }
        console.log('Sample history recorded.', historyResults);
      callback(null, { insertId: id, masterID: masterID });
    });
  });
});
};




// Function to update a sample by its ID (in Collectionsite)
const updateSample = (id, data, callback) => {
  console.log(data.status);
  const query = `
    UPDATE sample
    SET donorID = ?, samplename = ?, age = ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, ContainerType = ?, CountryOfCollection = ?, quantity = ?, QuantityUnit = ?, SampleTypeMatrix = ?, SmokingStatus = ?, AlcoholOrDrugAbuse = ?, InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?, FreezeThawCycles = ?, DateOfCollection = ?, ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, DiagnosisTestParameter = ?, TestResult = ?, TestResultUnit = ?, TestMethod = ?, TestKitManufacturer = ?, TestSystem = ?, TestSystemManufacturer=?, status = ?
    WHERE id = ?`;

  const values = [
    data.donorID, data.samplename, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions,
    data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, data.status, id
  ];

  mysqlConnection.query(query, values, (err, result) => {
     // Insert into sample_history
     const historyQuery = `
     INSERT INTO sample_history (sample_id)
     VALUES (?)`;
   
   mysqlConnection.query(historyQuery, [id], (err, historyResults) => {
     if (err) {
       console.error('Error inserting into sample_history:', err);
       return callback(err, null);
     }
     console.log('Sample history recorded.', historyResults);
    callback(err, result);
  });
});
};

// Function to update a sample's status
const updateSampleStatus = (id, status, callback) => {
  const query = `
    UPDATE sample
    SET status = ?
    WHERE id = ?`;

  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
};

// Function to delete a sample by its ID
const deleteSample = (id, callback) => {
  const query = 'UPDATE sample SET is_deleted = TRUE WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

const getFilteredSamples = (price, smokingStatus, callback) => {
  let query = "SELECT * FROM sample WHERE is_deleted = FALSE";
  let queryParams = [];

  if (price) {
    query += " AND price <= ?";
    queryParams.push(price);
  }

  if (smokingStatus) {
    query += " AND SmokingStatus = ?";
    queryParams.push(smokingStatus);
  }

  mysqlConnection.query(query, queryParams, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

module.exports = {
  getFilteredSamples,
  createSampleTable,
  getSamples,
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  updateSampleStatus,
  deleteSample
};