const mysqlConnection = require("../config/db");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const create_biobankTable = () => {
  const create_biobankTable = `
  CREATE TABLE IF NOT EXISTS biobank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_account_id INT,
    Name VARCHAR(100),
    FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
)`;

  mysqlConnection.query(create_biobankTable, (err, results) => {
    if (err) {
      console.error("Error biobank table: ", err);
    } else {
      console.log("Biobank table created Successfully");
    }
  });
};

const getBiobankSamples = (user_account_id, page, pageSize, priceFilter, searchField, searchValue, callback) => {
  const pageInt = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 10;
  const offset = (pageInt - 1) * pageSizeInt;

  // Start building base query
  let baseQuery = `
    FROM sample
    WHERE status = "In Stock"
      AND is_deleted = FALSE
  `;

  const queryParams = [];

  // Add price filter if requested
  if (priceFilter === "priceAdded") {
    baseQuery += ` AND price IS NOT NULL AND price > 0 `;
  } else if (priceFilter === "priceNotAdded") {
    baseQuery += ` AND (price IS NULL OR price = 0) `;
  }

  // Add search filter if provided
  if (searchField && searchValue) {
    baseQuery += ` AND ?? LIKE ? `;
    queryParams.push(searchField, `%${searchValue}%`);
  }

  // Main query with pagination
  const dataQuery = `
    SELECT *
    ${baseQuery}
    ORDER BY id DESC
    LIMIT ? OFFSET ?;
  `;
  // Add pagination values to parameters
  queryParams.push(pageSizeInt, offset);

  mysqlConnection.query(dataQuery, queryParams, (err, results) => {
    if (err) return callback(err);

    // Count query (without pagination)
    const countQuery = `SELECT COUNT(*) AS totalCount ${baseQuery}`;

    mysqlConnection.query(countQuery, queryParams.slice(0, -2), (err, countResults) => {
      if (err) return callback(err);

      const totalCount = countResults[0].totalCount;

      callback(null, {
        results,
        totalCount,
      });
    });
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

  const insertQuery = `
    INSERT INTO sample (
      id, donorID, room_number, freezer_id, box_id, user_account_id, packsize,samplename, phoneNumber,age, gender, ethnicity, samplecondition, storagetemp, ContainerType, CountryOfCollection, price, SamplePriceCurrency, quantity, QuantityUnit, SampleTypeMatrix, SmokingStatus, AlcoholOrDrugAbuse, InfectiousDiseaseTesting, InfectiousDiseaseResult, FreezeThawCycles, DateOfCollection, ConcurrentMedicalConditions, ConcurrentMedications, DiagnosisTestParameter, TestResult, TestResultUnit, TestMethod, TestKitManufacturer, TestSystem, TestSystemManufacturer, status, logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlConnection.query(insertQuery, [
    id, data.donorID, room_number, freezer_id, box_id, data.user_account_id,data.packsize, data.samplename,data.phoneNumber, data.age, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency, data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection, data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, 'In Stock', data.logo
  ], (err, results) => {
    if (err) {
      console.error('Error inserting into sample:', err);
      return callback(err, null);
    }

    const updateQuery = `UPDATE sample SET masterID = ? WHERE id = ?`;
    mysqlConnection.query(updateQuery, [masterID, id], (err, updateResults) => {
      if (err) {
        console.error('Error updating masterID:', err);
        return callback(err, null);
      }

      const historyQuery = `
        INSERT INTO sample_history (sample_id)
        VALUES (?)
      `;

      mysqlConnection.query(historyQuery, [id], (err, historyResults) => {
        if (err) {
          console.error('Error inserting into sample_history:', err);
          return callback(err, null);
        }

        // 🟰 Now everything is successful
        callback(null, { insertId: id, masterID: masterID });
      });
    });
  });
};

// Function to add price and sample price currency from biobank
const postSamplePrice = (data, callback) => {
  const updateQuery = `
    UPDATE sample 
    SET price = ?, SamplePriceCurrency = ?
    WHERE id = ?
  `;

  mysqlConnection.query(updateQuery, [data.price, data.SamplePriceCurrency, data.sampleId], (err, results) => {
    if (err) {
      console.error('Error adding price and currency into sample:', err);
      return callback(err, null);
    }

    // Insert into sample_history table
    const historyQuery = `
      INSERT INTO sample_history (sample_id)
      VALUES (?)
    `;

    mysqlConnection.query(historyQuery, [data.sampleId], (err, historyResults) => {
      if (err) {
        console.error('Error inserting into sample_history:', err);
        return callback(err, null);
      }

      return callback(null, { insertId: data.sampleId });
    });
  });
};


// Function to update a sample by its ID
const updateBiobankSample = (id, data, callback) => {

  // Initialize to null instead of 'null' string
  let room_number = null;
  let freezer_id = null;
  let box_id = null;

  // Ensure locationids is split into the expected components and check if each part is a valid number
  if (data.locationids) {
    const parts = data.locationids.split("-");

    // Check if each part is a valid number, otherwise set to null
    room_number = isNaN(parts[0]) ? null : Number(parts[0]);
    freezer_id = isNaN(parts[1]) ? null : Number(parts[1]);
    box_id = isNaN(parts[2]) ? null : Number(parts[2]);
  }

  const query = `
    UPDATE sample
    SET room_number = ?, freezer_id = ?, box_id = ?, packsize=?,samplename = ?, age = ?, phoneNumber= ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, ContainerType = ?, CountryOfCollection = ?, price = ?, SamplePriceCurrency = ?,
        quantity = ?, QuantityUnit = ?, SampleTypeMatrix = ?, SmokingStatus = ?, AlcoholOrDrugAbuse = ?, 
        InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?, FreezeThawCycles = ?, DateOfCollection = ?, 
        ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, DiagnosisTestParameter = ?, TestResult = ?,
        TestResultUnit = ?, TestMethod = ?, TestKitManufacturer = ?, TestSystem = ?, TestSystemManufacturer = ?, status = ?, logo = ?
    WHERE id = ?
  `;

  const values = [
    room_number, freezer_id, box_id,data.packsize, data.samplename, data.age, data.phoneNumber, data.gender, data.ethnicity, data.samplecondition,
    data.storagetemp, data.ContainerType, data.CountryOfCollection, data.price, data.SamplePriceCurrency,
    data.quantity, data.QuantityUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse,
    data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfCollection,
    data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.DiagnosisTestParameter, data.TestResult,
    data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer,
    data.status, data.logo, id
  ];

  mysqlConnection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating sample:', err);
      return callback(err, null);
    }

    const historyQuery = `
      INSERT INTO sample_history (sample_id)
      VALUES (?)
    `;

    mysqlConnection.query(historyQuery, [id], (err, historyResult) => {
      if (err) {
        console.error('Error inserting into sample_history:', err);
        return callback(err, null);
      }

      // 🟰 Now everything is successful
      callback(null, { message: 'Sample updated and history recorded successfully.' });
    });
  });
};

const UpdateSampleStatus = (id, status, callback) => {

  const query = `
    UPDATE sample
    SET sample_visibility = ?
    WHERE id = ?
  `;

  const values = [status, id];

  mysqlConnection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating sample:', err);
      return callback(err, null);
    }

    callback(null, { message: 'Sample status updated successfully.' });
  });
};

const getQuarantineStock = (callback) => {
  const query = `SELECT * FROM sample WHERE status =  "Quarantine" and is_deleted = false`;

  mysqlConnection.query(query, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results); 
  });
};


module.exports = {
  create_biobankTable,
  getBiobankSamples,
  createBiobankSample,
  postSamplePrice,
  updateBiobankSample,
  getQuarantineStock,
  UpdateSampleStatus

};
