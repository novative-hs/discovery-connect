const mysqlConnection = require("../config/db");

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
        storagetemp FLOAT,
        storagetempUnit VARCHAR(10),
        ContainerType VARCHAR(50),
        CountryOfCollection VARCHAR(50),
        price FLOAT,
        SamplePriceCurrency VARCHAR(10),
        quantity FLOAT,
        QuantityUnit VARCHAR(20),
        labname VARCHAR(100),
        SampleTypeMatrix VARCHAR(100),
        TypeMatrixSubtype VARCHAR(100),
        ProcurementType VARCHAR(50),
        endTime DATETIME,
        SmokingStatus VARCHAR(50),
        TestMethod VARCHAR(100),
        TestResult VARCHAR(100),
        TestResultUnit VARCHAR(20),
        InfectiousDiseaseTesting VARCHAR(100),
        InfectiousDiseaseResult VARCHAR(100),
        logo VARCHAR(255),
        status VARCHAR(20) DEFAULT 'In Stock',
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
const getAllSamples = (callback) => {
  const query = 'SELECT * FROM sample WHERE status = "In Stock"';
  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
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
  const query = `
    INSERT INTO sample (
      masterID, donorID, samplename, age, gender, ethnicity, samplecondition,
      storagetemp, storagetempUnit, ContainerType, CountryOfCollection,
      price, SamplePriceCurrency, quantity, QuantityUnit, labname,
      SampleTypeMatrix, TypeMatrixSubtype, ProcurementType, endTime,
      SmokingStatus, TestMethod, TestResult, TestResultUnit,
      InfectiousDiseaseTesting, InfectiousDiseaseResult, logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    data.masterID, data.donorID, data.samplename, data.age, data.gender,
    data.ethnicity, data.samplecondition, data.storagetemp, data.storagetempUnit,
    data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency,
    data.quantity, data.QuantityUnit, data.labname, data.SampleTypeMatrix,
    data.TypeMatrixSubtype, data.ProcurementType, data.endTime, data.SmokingStatus,
    data.TestMethod, data.TestResult, data.TestResultUnit, data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult, data.logo
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
};

// Function to update a sample by its ID
const updateSample = (id, data, callback) => {
  const query = `
    UPDATE sample
    SET masterID = ?, donorID = ?, samplename = ?, age = ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, storagetempUnit = ?, ContainerType = ?, CountryOfCollection = ?, price = ?,
        SamplePriceCurrency = ?, quantity = ?, QuantityUnit = ?, labname = ?, SampleTypeMatrix = ?,
        TypeMatrixSubtype = ?, ProcurementType = ?, endTime = ?, SmokingStatus = ?, TestMethod = ?,
        TestResult = ?, TestResultUnit = ?, InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?, logo = ?
    WHERE id = ?`;

  const values = [
    data.masterID, data.donorID, data.samplename, data.age, data.gender,
    data.ethnicity, data.samplecondition, data.storagetemp, data.storagetempUnit,
    data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency,
    data.quantity, data.QuantityUnit, data.labname, data.SampleTypeMatrix,
    data.TypeMatrixSubtype, data.ProcurementType, data.endTime, data.SmokingStatus,
    data.TestMethod, data.TestResult, data.TestResultUnit, data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult, data.logo, id
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
  const query = 'DELETE FROM sample WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createSampleTable,
  getAllSamples,
  getSampleById,
  createSample,
  updateSample,
  updateSampleStatus,
  deleteSample
};
