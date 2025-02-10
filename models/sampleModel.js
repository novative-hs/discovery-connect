const mysqlConnection = require("../config/db");
const fs = require('fs');
const path = require('path');
// Function to create the sample table
const createSampleTable = () => {
  const sampleTable = `
    CREATE TABLE IF NOT EXISTS sample (
        id INT AUTO_INCREMENT PRIMARY KEY,
        masterID VARCHAR(50),
        donorID VARCHAR(50),
        samplename VARCHAR(100),
        age INT,
        gender VARCHAR(10),
        ethnicity VARCHAR(50),
        samplecondition VARCHAR(100),
        storagetemp VARCHAR(255),
        storagetempUnit VARCHAR(255),
        ContainerType VARCHAR(50),
        CountryOfCollection VARCHAR(50),
        price FLOAT,
        SamplePriceCurrency VARCHAR(255),
        quantity FLOAT,
        QuantityUnit VARCHAR(20),
        labname VARCHAR(100),
        SampleTypeMatrix VARCHAR(100),
        TypeMatrixSubtype VARCHAR(100),
        ProcurementType VARCHAR(50),
        SmokingStatus VARCHAR(50),
        TestMethod VARCHAR(100),
        TestResult VARCHAR(100),
        TestResultUnit VARCHAR(20),
        InfectiousDiseaseTesting VARCHAR(100),
        InfectiousDiseaseResult VARCHAR(100),
        CutOffRange VARCHAR(50), 
        CutOffRangeUnit VARCHAR(50), 
        FreezeThawCycles VARCHAR(50), 
        DateOfCollection VARCHAR(50),
        ConcurrentMedicalConditions VARCHAR(50), 
        ConcurrentMedications VARCHAR(50), 
        AlcoholOrDrugAbuse VARCHAR(50),
        DiagnosisTestParameter VARCHAR(50), 
        ResultRemarks VARCHAR(50), 
        TestKit VARCHAR(50),
        TestKitManufacturer VARCHAR(50),
        TestSystem VARCHAR(50),
        TestSystemManufacturer VARCHAR(50),
        endTime VARCHAR(50),
        status VARCHAR(20) DEFAULT 'In Stock',
        user_account_id INT,
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
      cs.CollectionSiteName AS CollectionSiteName,
      c.name AS CityName,
      d.name AS DistrictName
    FROM 
      sample s
    JOIN 
      collectionsite cs ON s.user_account_id = cs.user_account_id
    JOIN 
      city c ON cs.city = c.id
    JOIN 
      district d ON cs.district = d.id
    WHERE 
      s.status = 'In Stock'
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

// Function to create a new sample
const createSample = (data, callback) => {
  console.log("Inserting data into database:", data);
  console.log(data);
  const query = `
    INSERT INTO sample (
      masterID, donorID, samplename, age, gender, ethnicity, samplecondition,
      storagetemp, storagetempUnit, ContainerType, CountryOfCollection,
      price, SamplePriceCurrency, quantity, QuantityUnit, labname,
      SampleTypeMatrix, TypeMatrixSubtype, ProcurementType,
      SmokingStatus, TestMethod, TestResult, TestResultUnit,
      InfectiousDiseaseTesting, InfectiousDiseaseResult, 
      CutOffRange, CutOffRangeUnit, FreezeThawCycles, DateOfCollection,
      ConcurrentMedicalConditions, ConcurrentMedications, AlcoholOrDrugAbuse,
      DiagnosisTestParameter, ResultRemarks, TestKit, TestKitManufacturer,
      TestSystem, TestSystemManufacturer, endTime, status, user_account_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    mysqlConnection.query(query, [
      data.masterID, data.donorID, data.samplename, data.age, data.gender, data.ethnicity,
      data.samplecondition, data.storagetemp, data.storagetempUnit, data.ContainerType,
      data.CountryOfCollection, data.price, data.SamplePriceCurrency, data.quantity, data.QuantityUnit,
      data.labname, data.SampleTypeMatrix, data.TypeMatrixSubtype, data.ProcurementType,
      data.SmokingStatus, data.TestMethod, data.TestResult, data.TestResultUnit,
      data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.CutOffRange, data.CutOffRangeUnit,
      data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions,
      data.ConcurrentMedications, data.AlcoholOrDrugAbuse, data.DiagnosisTestParameter, data.ResultRemarks,
      data.TestKit, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, data.endTime,  'In Stock', data.user_account_id
    ], (err, results) => {
      if (err) {
        console.error('Error in MySQL query:', err);  // Log the MySQL query error
        callback(err, null);
      } else {
        console.log('Insert result:', results);  // Log the results of the query
        callback(null, results);
      }
    });
  };



// Function to update a sample by its ID
const updateSample = (id, data, callback) => {
  console.log(data.status);
  const query = `
    UPDATE sample
    SET masterID = ?, donorID = ?, samplename = ?, age = ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, storagetempUnit = ?, ContainerType = ?, CountryOfCollection = ?, price = ?,
        SamplePriceCurrency = ?, quantity = ?, QuantityUnit = ?, labname = ?, SampleTypeMatrix = ?,
        TypeMatrixSubtype = ?, ProcurementType = ?, SmokingStatus = ?, TestMethod = ?,
        TestResult = ?, TestResultUnit = ?, InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?,
        CutOffRange = ?, CutOffRangeUnit = ?, FreezeThawCycles = ?, DateOfCollection = ?,
        ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, AlcoholOrDrugAbuse = ?,
        DiagnosisTestParameter = ?, ResultRemarks = ?, TestKit = ?, TestKitManufacturer = ?,
        TestSystem = ?, TestSystemManufacturer=?, endTime = ?, status = ?
    WHERE id = ?`;

  const values = [
    data.masterID, data.donorID, data.samplename, data.age, data.gender,
    data.ethnicity, data.samplecondition, data.storagetemp, data.storagetempUnit,
    data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency,
    data.quantity, data.QuantityUnit, data.labname, data.SampleTypeMatrix,
    data.TypeMatrixSubtype, data.ProcurementType, data.SmokingStatus,
    data.TestMethod, data.TestResult, data.TestResultUnit, data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult, data.CutOffRange, data.CutOffRangeUnit,
    data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions,
    data.ConcurrentMedications, data.AlcoholOrDrugAbuse, data.DiagnosisTestParameter,
    data.ResultRemarks, data.TestKit, data.TestKitManufacturer, data.TestSystem,data.TestSystemManufacturer, data.endTime,
    data.status, id
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
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


module.exports = {
  createSampleTable,
  getSamples,
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  updateSampleStatus,
  deleteSample
};