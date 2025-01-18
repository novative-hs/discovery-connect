const mysqlConnection = require("../config/db");

// Function to get all samples with 'In Stock' status
const getAllBioBank = (callback) => {
  const query = 'SELECT * FROM sample WHERE status = "In Stock"';
  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};

// Function to get a sample by its ID
const getBioBankById = (id, callback) => {
  const query = 'SELECT * FROM sample WHERE user_account_id = ? and status = "In Stock"';
  mysqlConnection.query(query, [id], (err, results) => {
    callback(err, results);
  });
};

// Function to create a new sample
const createBioBank = (data, callback) => {
  console.log(data);
  const query = `
  INSERT INTO sample (
    masterID, donorID, samplename, age, gender, ethnicity, samplecondition,
    storagetemp, storagetempUnit, ContainerType, CountryOfCollection,
    price, SamplePriceCurrency, quantity, QuantityUnit, labname,
    SampleTypeMatrix, TypeMatrixSubtype, ProcurementType, endTime,
    SmokingStatus, TestMethod, TestResult, TestResultUnit,
    InfectiousDiseaseTesting, InfectiousDiseaseResult, 
    CutOffRange, CutOffRangeUnit, FreezeThawCycles, DateOfCollection,
    ConcurrentMedicalConditions, ConcurrentMedications, AlcoholOrDrugAbuse,
    DiagnosisTestParameter, ResultRemarks, TestKit, TestKitManufacturer,
    TestSystem, TestSystemManufacturer, status,user_account_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

const values = [
  data.masterID, data.donorID, data.samplename, data.age, data.gender,
  data.ethnicity, data.samplecondition, data.storagetemp, data.storagetempUnit,
  data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency,
  data.quantity, data.QuantityUnit, data.labname, data.SampleTypeMatrix,
  data.TypeMatrixSubtype, data.ProcurementType, data.endTime, data.SmokingStatus,
  data.TestMethod, data.TestResult, data.TestResultUnit, data.InfectiousDiseaseTesting,
  data.InfectiousDiseaseResult, data.CutOffRange, data.CutOffRangeUnit, 
  data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions, 
  data.ConcurrentMedications, data.AlcoholOrDrugAbuse, data.DiagnosisTestParameter, 
  data.ResultRemarks, data.TestKit, data.TestKitManufacturer, data.TestSystem,
  data.TestSystemManufacturer, data.status,data.user_account_id
];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
};


// Function to update a sample by its ID
const updateBioBank = (id, data, callback) => {
  console.log(data.status);
  const query = `
    UPDATE sample
    SET masterID = ?, donorID = ?, samplename = ?, age = ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, storagetempUnit = ?, ContainerType = ?, CountryOfCollection = ?, price = ?,
        SamplePriceCurrency = ?, quantity = ?, QuantityUnit = ?, labname = ?, SampleTypeMatrix = ?,
        TypeMatrixSubtype = ?, ProcurementType = ?, endTime = ?, SmokingStatus = ?, TestMethod = ?,
        TestResult = ?, TestResultUnit = ?, InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?,
        CutOffRange = ?, CutOffRangeUnit = ?, FreezeThawCycles = ?, DateOfCollection = ?,
        ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, AlcoholOrDrugAbuse = ?,
        DiagnosisTestParameter = ?, ResultRemarks = ?, TestKit = ?, TestKitManufacturer = ?,
        TestSystem = ?, TestSystemManufacturer=?,status = ?
    WHERE id = ?`;

  const values = [
    data.masterID, data.donorID, data.samplename, data.age, data.gender,
    data.ethnicity, data.samplecondition, data.storagetemp, data.storagetempUnit,
    data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency,
    data.quantity, data.QuantityUnit, data.labname, data.SampleTypeMatrix,
    data.TypeMatrixSubtype, data.ProcurementType, data.endTime, data.SmokingStatus,
    data.TestMethod, data.TestResult, data.TestResultUnit, data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult, data.CutOffRange, data.CutOffRangeUnit,
    data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions,
    data.ConcurrentMedications, data.AlcoholOrDrugAbuse, data.DiagnosisTestParameter,
    data.ResultRemarks, data.TestKit, data.TestKitManufacturer, data.TestSystem,data.TestSystemManufacturer,
    data.status, id
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
};

// Function to update a sample's status
const updateBioBankStatus = (id, status, callback) => {
  const query = `
    UPDATE sample
    SET status = ?
    WHERE id = ?`;

  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
};

// Function to delete a sample by its ID
const deleteBioBank  = (id, callback) => {
  const query = 'DELETE FROM sample WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};


module.exports = {
  getAllBioBank,
  getBioBankById,
  createBioBank,
  updateBioBank,
  updateBioBankStatus,
  deleteBioBank 
};
