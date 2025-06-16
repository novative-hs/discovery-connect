const mysqlConnection = require("../config/db");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

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

  let baseWhereShared = `sample.status = "In Stock" AND sample.is_deleted = FALSE`;
  let baseWhereOwn = `sample.status = "In Stock" AND sample.is_deleted = FALSE`;
  const paramsShared = [];
  const paramsOwn = [];

  const likeValue = `%${searchValue?.toLowerCase()}%`;

  // Price filter
  if (priceFilter === "priceAdded") {
    baseWhereShared += ` AND sample.price IS NOT NULL AND sample.price > 0`;
    baseWhereOwn += ` AND sample.price IS NOT NULL AND sample.price > 0`;
  } else if (priceFilter === "priceNotAdded") {
    baseWhereShared += ` AND (sample.price IS NULL OR sample.price = 0)`;
    baseWhereOwn += ` AND (sample.price IS NULL OR sample.price = 0)`;
  }

  // Search filter
  if (searchField && searchValue) {
    switch (searchField) {
      case "locationids":
        baseWhereShared += ` AND (LOWER(sample.room_number) LIKE ? OR LOWER(sample.freezer_id) LIKE ? OR LOWER(sample.box_id) LIKE ?)`;
        baseWhereOwn += ` AND (LOWER(sample.room_number) LIKE ? OR LOWER(sample.freezer_id) LIKE ? OR LOWER(sample.box_id) LIKE ?)`;
        paramsShared.push(likeValue, likeValue, likeValue);
        paramsOwn.push(likeValue, likeValue, likeValue);
        break;

      case "price":
        baseWhereShared += ` AND CONCAT_WS(' ', sample.price, sample.SamplePriceCurrency) LIKE ?`;
        baseWhereOwn += ` AND CONCAT_WS(' ', sample.price, sample.SamplePriceCurrency) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "volume":
        baseWhereShared += ` AND (LOWER(CONCAT_WS(' ', sample.volume, sample.VolumeUnit)) LIKE ? OR LOWER(sample.VolumeUnit) = ?)`;
        baseWhereOwn += ` AND (LOWER(CONCAT_WS(' ', sample.volume, sample.VolumeUnit)) LIKE ? OR LOWER(sample.VolumeUnit) = ?)`;
        paramsShared.push(likeValue, searchValue.toLowerCase());
        paramsOwn.push(likeValue, searchValue.toLowerCase());
        break;

      case "TestResult":
        baseWhereShared += ` AND LOWER(CONCAT_WS(' ', sample.TestResult, sample.TestResultUnit)) LIKE ?`;
        baseWhereOwn += ` AND LOWER(CONCAT_WS(' ', sample.TestResult, sample.TestResultUnit)) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "gender":
        baseWhereShared += ` AND LOWER(sample.gender) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.gender) LIKE ?`;
        paramsShared.push(`${searchValue.toLowerCase()}%`);
        paramsOwn.push(`${searchValue.toLowerCase()}%`);
        break;

      case "CollectionSiteName":
        baseWhereShared += ` AND LOWER(collectionsite.CollectionSiteName) LIKE ?`;
        paramsShared.push(likeValue);
        // Do not include this filter in baseWhereOwn because collectionsite is not joined there
        break;

      default:
        baseWhereShared += ` AND LOWER(sample.\`${searchField}\`) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.\`${searchField}\`) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;
    }
  }

  const sharedSamplesQuery = `
    SELECT sample.*, collectionsite.CollectionSiteName
    FROM sample
    JOIN collectionsitestaff ON sample.user_account_id = collectionsitestaff.user_account_id
    JOIN collectionsite ON collectionsitestaff.collectionsite_id = collectionsite.id
    WHERE ${baseWhereShared}
  `;

  const ownSamplesQuery = `
    SELECT sample.*, NULL AS CollectionSiteName
    FROM sample
    WHERE ${baseWhereOwn} AND sample.user_account_id = ?
  `;

  const dataQuery = `
    SELECT * FROM (
      ${sharedSamplesQuery}
      UNION ALL
      ${ownSamplesQuery}
    ) AS merged_samples
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS totalCount FROM (
      ${sharedSamplesQuery}
      UNION ALL
      ${ownSamplesQuery}
    ) AS countCombined
  `;

  const finalParams = [...paramsShared, ...paramsOwn, user_account_id, pageSizeInt, offset];
  const countParams = [...paramsShared, ...paramsOwn, user_account_id];

  mysqlConnection.query(dataQuery, finalParams, (err, results) => {
    if (err) {
      console.error("❌ Data Query Error:", err.sqlMessage || err.message);
      return callback(err);
    }

    const enrichedResults = results.map((sample) => ({
      ...sample,
      locationids: [sample.room_number, sample.freezer_id, sample.box_id]
        .filter(Boolean)
        .join("-"),
    }));

    mysqlConnection.query(countQuery, countParams, (err, countResults) => {
      if (err) return callback(err);
      const totalCount = countResults[0].totalCount;
      callback(null, { samples: enrichedResults, totalCount });
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
      id, MRNumber, room_number, freezer_id, box_id, user_account_id, volume, Analyte, phoneNumber,age, gender, ethnicity, samplecondition, storagetemp, ContainerType, CountryOfCollection, price, SamplePriceCurrency, quantity, QuantityUnit, SampleTypeMatrix, SmokingStatus, AlcoholOrDrugAbuse, InfectiousDiseaseTesting, InfectiousDiseaseResult, FreezeThawCycles, DateOfSampling, ConcurrentMedicalConditions, ConcurrentMedications, TestResult, TestResultUnit, TestMethod, TestKitManufacturer, TestSystem, TestSystemManufacturer, status, logo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlConnection.query(
    insertQuery,
    [
      id,
      data.MRNumber,
      room_number,
      freezer_id,
      box_id,
      data.user_account_id,
      data.volume,
      data.Analyte,
      data.phoneNumber,
      data.age,
      data.gender,
      data.ethnicity,
      data.samplecondition,
      data.storagetemp,
      data.ContainerType,
      data.CountryOfCollection,
      data.price,
      data.SamplePriceCurrency,
      data.quantity,
      data.QuantityUnit,
      data.SampleTypeMatrix,
      data.SmokingStatus,
      data.AlcoholOrDrugAbuse,
      data.InfectiousDiseaseTesting,
      data.InfectiousDiseaseResult,
      data.FreezeThawCycles,
      data.DateOfSampling,
      data.ConcurrentMedicalConditions,
      data.ConcurrentMedications,
      data.TestResult,
      data.TestResultUnit,
      data.TestMethod,
      data.TestKitManufacturer,
      data.TestSystem,
      data.TestSystemManufacturer,
      "In Stock",
      data.logo,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting into sample:", err);
        return callback(err, null);
      }

      const updateQuery = `UPDATE sample SET masterID = ? WHERE id = ?`;
      mysqlConnection.query(
        updateQuery,
        [masterID, id],
        (err, updateResults) => {
          if (err) {
            console.error("Error updating masterID:", err);
            return callback(err, null);
          }

          const historyQuery = `
        INSERT INTO sample_history (sample_id)
        VALUES (?)
      `;

          mysqlConnection.query(historyQuery, [id], (err, historyResults) => {
            if (err) {
              console.error("Error inserting into sample_history:", err);
              return callback(err, null);
            }

            // 🟰 Now everything is successful
            callback(null, { insertId: id, masterID: masterID });
          });
        }
      );
    }
  );
};

// Function to add price and sample price currency from biobank
const postSamplePrice = (data, callback) => {
  const updateQuery = `
    UPDATE sample 
    SET price = ?, SamplePriceCurrency = ?
    WHERE id = ?
  `;

  mysqlConnection.query(
    updateQuery,
    [data.price, data.SamplePriceCurrency, data.sampleId],
    (err, results) => {
      if (err) {
        console.error("Error adding price and currency into sample:", err);
        return callback(err, null);
      }

      // Insert into sample_history table
      const historyQuery = `
      INSERT INTO sample_history (sample_id)
      VALUES (?)
    `;

      mysqlConnection.query(
        historyQuery,
        [data.sampleId],
        (err, historyResults) => {
          if (err) {
            console.error("Error inserting into sample_history:", err);
            return callback(err, null);
          }

          return callback(null, { insertId: data.sampleId });
        }
      );
    }
  );
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
    SET room_number = ?, freezer_id = ?, box_id = ?, volume=?,Analyte = ?, age = ?, phoneNumber= ?, gender = ?, ethnicity = ?, samplecondition = ?,
        storagetemp = ?, ContainerType = ?, CountryOfCollection = ?, price = ?, SamplePriceCurrency = ?,
        quantity = ?, QuantityUnit = ?, SampleTypeMatrix = ?, SmokingStatus = ?, AlcoholOrDrugAbuse = ?, 
        InfectiousDiseaseTesting = ?, InfectiousDiseaseResult = ?, FreezeThawCycles = ?, DateOfSampling = ?, 
        ConcurrentMedicalConditions = ?, ConcurrentMedications = ?, Analyte = ?, TestResult = ?,
        TestResultUnit = ?, TestMethod = ?, TestKitManufacturer = ?, TestSystem = ?, TestSystemManufacturer = ?, status = ?, logo = ?
    WHERE id = ?
  `;

  const values = [
    room_number,
    freezer_id,
    box_id,
    data.volume,
    data.Analyte,
    data.age,
    data.phoneNumber,
    data.gender,
    data.ethnicity,
    data.samplecondition,
    data.storagetemp,
    data.ContainerType,
    data.CountryOfCollection,
    data.price,
    data.SamplePriceCurrency,
    data.quantity,
    data.QuantityUnit,
    data.SampleTypeMatrix,
    data.SmokingStatus,
    data.AlcoholOrDrugAbuse,
    data.InfectiousDiseaseTesting,
    data.InfectiousDiseaseResult,
    data.FreezeThawCycles,
    data.DateOfSampling,
    data.ConcurrentMedicalConditions,
    data.ConcurrentMedications,
    data.Analyte,
    data.TestResult,
    data.TestResultUnit,
    data.TestMethod,
    data.TestKitManufacturer,
    data.TestSystem,
    data.TestSystemManufacturer,
    data.status,
    data.logo,
    id,
  ];

  mysqlConnection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating sample:", err);
      return callback(err, null);
    }

    const historyQuery = `
      INSERT INTO sample_history (sample_id)
      VALUES (?)
    `;

    mysqlConnection.query(historyQuery, [id], (err, historyResult) => {
      if (err) {
        console.error("Error inserting into sample_history:", err);
        return callback(err, null);
      }

      // 🟰 Now everything is successful
      callback(null, {
        message: "Sample updated and history recorded successfully.",
      });
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
      console.error("Error updating sample:", err);
      return callback(err, null);
    }

    callback(null, { message: "Sample status updated successfully." });
  });
};

const getQuarantineStock = (callback) => {
  const query = `SELECT * FROM sample WHERE status =  "Quarantine" and is_deleted = false`;

  mysqlConnection.query(query, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

// Function to get samples with price > 0 in sample visibility page
const getBiobankVisibilitySamples = (
  user_account_id,
  page,
  pageSize,
  searchField,
  searchValue,
  callback
) => {
  const pageInt = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 10;
  const offset = (pageInt - 1) * pageSizeInt;

  let baseWhere = `WHERE status = "In Stock" AND is_deleted = FALSE AND price IS NOT NULL AND price > 0`;
  const paramsForWhere = [];

  if (searchField && searchValue) {
    baseWhere += ` AND ?? LIKE ?`;
    paramsForWhere.push(searchField, `%${searchValue}%`);
  }

  const dataQuery = `
    SELECT *
    FROM sample
    ${baseWhere}
    ORDER BY id DESC
    LIMIT ? OFFSET ?;
  `;
  const dataParams = [...paramsForWhere, pageSizeInt, offset];

  mysqlConnection.query(dataQuery, dataParams, (err, results) => {
    if (err) return callback(err);

    const enrichedResults = results.map((sample) => ({
      ...sample,
      locationids: [sample.room_number, sample.freezer_id, sample.box_id]
        .filter(Boolean)
        .join("-"),
    }));

    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM sample
      ${baseWhere};
    `;

    mysqlConnection.query(countQuery, paramsForWhere, (err, countResults) => {
      if (err) return callback(err);

      const totalCount = countResults[0].totalCount;

      callback(null, {
        results: enrichedResults,
        totalCount,
      });
    });
  });
};

// Get price dropdown while adding price in Biobank
const getPrice = (name, callback) => {

  const query = 'SELECT DISTINCT price FROM sample WHERE Analyte = ?';
  const query = 'SELECT DISTINCT price FROM sample WHERE diseasename = ?';

  mysqlConnection.query(query, [name], (err, results) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  create_biobankTable,
  createBiobankSample,
  getBiobankSamples,
  postSamplePrice,
  getQuarantineStock,
  getBiobankVisibilitySamples,
  UpdateSampleStatus,
  getPrice,
};
