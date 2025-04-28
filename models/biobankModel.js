const mysqlConnection = require("../config/db");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Function to get all samples with 'In Stock' status
const getBiobankSamples = (id, callback) => {
  // Validate and parse `id`
  const user_account_id = parseInt(id);
  if (isNaN(user_account_id)) {
    console.error("Invalid user_account_id:", id);
    return callback(new Error("Invalid user_account_id"), null);
  }
  const query = `
    SELECT *
    FROM sample
    WHERE status = "In Stock" 
      AND is_deleted = FALSE
      ORDER BY id DESC;
  `;
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};


// Function to create a new sample
const createBiobankSample = (data, callback) => {
  

  const id = uuidv4(); // Generate a secure unique ID
  const masterID = uuidv4(); // Secure Master ID

  let room_number = null;
  let freezer_id = null;
  let box_id = null;

  if (data.locationids) {
    const parts = data.locationids.split("-");
    room_number = parts[0] || null;
    freezer_id = parts[1] || null;
    box_id = parts[2] || null;
  }

  const query = `
    INSERT INTO sample (
      id, donorID, room_number, freezer_id, box_id, user_account_id, samplename, age, gender, ethnicity, samplecondition, storagetemp, ContainerType, CountryOfCollection, price, SamplePriceCurrency, quantity, QuantityUnit, SampleTypeMatrix, SmokingStatus, AlcoholOrDrugAbuse, InfectiousDiseaseTesting, InfectiousDiseaseResult, FreezeThawCycles, DateOfCollection, ConcurrentMedicalConditions, ConcurrentMedications, DiagnosisTestParameter, TestResult, TestResultUnit, TestMethod, TestKitManufacturer, TestSystem, TestSystemManufacturer, status,logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  mysqlConnection.query(query, [
    id, data.donorID, room_number, freezer_id, box_id, data.user_account_id, data.samplename, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, 'In Stock', data.logo
  ], (err, results) => {
    if (err) {
      console.error('Error in MySQL query:', err);
      return callback(err, null);
    }

    

    // Now update masterID
    const updateQuery = `UPDATE sample SET masterID = ? WHERE id = ?`;
    mysqlConnection.query(updateQuery, [masterID, id], (err, updateResults) => {
      if (err) {
        console.error('Error updating masterID:', err);
        return callback(err, null);
      }
      
      callback(null, { insertId: id, masterID: masterID });
    });
  });
};

// Function to update a sample by its ID
const updateBiobankSample = (id, data, callback) => {
  console.log(data.status);

  let room_number = null;
  let freezer_id = null;
  let box_id = null;

  if (data.locationids) {
    const parts = data.locationids.split("-");
    room_number = parts[0] || null;
    freezer_id = parts[1] || null;
    box_id = parts[2] || null;
  }
  const query = `
    UPDATE sample
    SET  room_number = ?, freezer_id = ?, box_id = ?, samplename = ?, age = ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, ContainerType = ?, CountryOfCollection = ?, price = ?, SamplePriceCurrency = ?,
         quantity = ?, QuantityUnit = ?, SampleTypeMatrix = ?, SmokingStatus = ?, AlcoholOrDrugAbuse = ?, 
         InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?, FreezeThawCycles = ?, DateOfCollection = ?, 
         ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, DiagnosisTestParameter = ?, TestResult = ?,
          TestResultUnit = ?, TestMethod = ?, TestKitManufacturer = ?, TestSystem = ?, TestSystemManufacturer=?, status = ?,
          logo=?
    WHERE id = ?`;

  const values = [
    room_number, freezer_id, box_id, data.samplename, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, data.status, data.logo, id
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  getBiobankSamples,
  createBiobankSample,
  updateBiobankSample

};
