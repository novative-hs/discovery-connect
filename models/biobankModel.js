const mysqlConnection = require("../config/db");

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
      AND is_deleted = FALSE;
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
  console.log("Inserting data into database:", data);
  console.log(data);

  // Generate a random 3-digit number
  const randomSuffix = Math.floor(100 + Math.random() * 900); // Ensures a 3-digit number
  // Calculate Master ID
  const id = parseInt(data.donorID) + parseInt(data.user_account_id);
  const masterID = `${id}${randomSuffix}`;

  const query = `
    INSERT INTO sample (
      id, donorID, user_account_id, samplename, age, gender, ethnicity, samplecondition, storagetemp, ContainerType, CountryOfCollection, price, SamplePriceCurrency, quantity, QuantityUnit, SampleTypeMatrix, SmokingStatus, AlcoholOrDrugAbuse, InfectiousDiseaseTesting, InfectiousDiseaseResult, FreezeThawCycles, DateOfCollection, ConcurrentMedicalConditions, ConcurrentMedications, DiagnosisTestParameter, TestResult, TestResultUnit, TestMethod, TestKitManufacturer, TestSystem, TestSystemManufacturer, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  mysqlConnection.query(query, [
    id, data.donorID, data.user_account_id, data.samplename, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, 'In Stock'
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
      callback(null, { insertId: id, masterID: masterID });
    });
  });
};

// Function to update a sample by its ID
const updateBiobankSample = (id, data, callback) => {
  console.log(data.status);
  const query = `
    UPDATE sample
    SET donorID = ?, samplename = ?, age = ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, ContainerType = ?, CountryOfCollection = ?, price = ?, SamplePriceCurrency = ?, quantity = ?, QuantityUnit = ?, SampleTypeMatrix = ?, SmokingStatus = ?, AlcoholOrDrugAbuse = ?, InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?, FreezeThawCycles = ?, DateOfCollection = ?, ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, DiagnosisTestParameter = ?, TestResult = ?, TestResultUnit = ?, TestMethod = ?, TestKitManufacturer = ?, TestSystem = ?, TestSystemManufacturer=?, status = ?
    WHERE id = ?`;

  const values = [
    data.donorID, data.samplename, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions,
    data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, data.status, id
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
