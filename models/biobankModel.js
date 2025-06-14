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

const getBiobankSamples = (
  user_account_id,
  page,
  pageSize,
  priceFilter,
  searchField,
  searchValue,
  callback
) => {
  const pageInt = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 10;
  const offset = (pageInt - 1) * pageSizeInt;

  let baseWhere = `sample.status = "In Stock" AND sample.is_deleted = FALSE`;
  const params = [];

  // Price filter
  if (priceFilter === "priceAdded") {
    baseWhere += ` AND price IS NOT NULL AND price > 0`;
  } else if (priceFilter === "priceNotAdded") {
    baseWhere += ` AND (price IS NULL OR price = 0)`;
  }

  // Search filter
  if (searchField && searchValue) {
    const likeValue = `%${searchValue.toLowerCase()}%`;

    switch (searchField) {
      case "diseasename":
        baseWhere += ` AND LOWER(diseasename) LIKE ?`;
        params.push(likeValue);
        break;
      case "SampleTypeMatrix":
        baseWhere += ` AND LOWER(SampleTypeMatrix) LIKE ?`;
        params.push(likeValue);
        break;
      case "ContainerType":
        baseWhere += ` AND LOWER(ContainerType) LIKE ?`;
        params.push(likeValue);
        break;
      case "sample_visibility":
        baseWhere += ` AND LOWER(sample_visibility) LIKE ?`;
        params.push(likeValue);
        break;


      case "locationids":
        baseWhere += ` AND (LOWER(room_number) LIKE ? OR LOWER(freezer_id) LIKE ? OR LOWER(box_id) LIKE ?)`;
        params.push(likeValue, likeValue, likeValue);
        break;

      case "volume":
        baseWhere += ` AND (LOWER(CONCAT_WS(' ', volume, QuantityUnit)) LIKE ? OR LOWER(QuantityUnit) = ?)`;
        params.push(likeValue, searchValue.toLowerCase());
        break;

      case "price":
        baseWhere += ` AND LOWER(CONCAT_WS(' ', price, SamplePriceCurrency)) LIKE ?`;
        params.push(likeValue);
        break;

      case "status":
        baseWhere += ` AND LOWER(sample.status) LIKE ?`;
        params.push(`${searchValue.toLowerCase()}%`);
        break;

      case "age":
        baseWhere += ` AND LOWER(age) LIKE ?`;
        params.push(`${searchValue.toLowerCase()}%`);
        break;

      case "gender":
        baseWhere += ` AND LOWER(gender) LIKE ?`;
        params.push(`${searchValue.toLowerCase()}%`);
        break;

      case "TestResult":
        baseWhere += ` AND LOWER(CONCAT_WS(' ', TestResult, TestResultUnit)) LIKE ?`;
        params.push(likeValue);
        break;

      default:
        // Prevent SQL injection by whitelisting valid fields only
        const allowedFields = ['sample_type', 'sample_name', 'donor_id']; // Add safe fields here
        if (allowedFields.includes(searchField)) {
          baseWhere += ` AND LOWER(${searchField}) LIKE ?`;
          params.push(likeValue);
        }
        break;
    }
  }

  // Own samples query
  const ownSamplesQuery = `
    SELECT sample.*, NULL AS CollectionSiteName
    FROM sample
    WHERE ${baseWhere} AND sample.user_account_id = ?
  `;

  // Shared samples query
  const sharedSamplesQuery = `
    SELECT sample.*, collectionsite.CollectionSiteName
    FROM sample
    JOIN collectionsitestaff ON sample.user_account_id = collectionsitestaff.user_account_id
    JOIN collectionsite ON collectionsitestaff.collectionsite_id = collectionsite.id
    WHERE ${baseWhere}
  `;

  // Final paginated query
  const dataQuery = `
    SELECT * FROM (
      ${sharedSamplesQuery}
      UNION ALL
      ${ownSamplesQuery}
    ) AS merged_samples
    LIMIT ? OFFSET ?
  `;

  // Count query (no pagination)
  const countQuery = `
    SELECT COUNT(*) AS totalCount FROM (
      ${sharedSamplesQuery}
      UNION ALL
      ${ownSamplesQuery}
    ) AS countCombined
  `;

  // Final parameters
  const finalParams = [...params, ...params, user_account_id, pageSizeInt, offset];
  const countParams = [...params, ...params, user_account_id];

  // Execute paginated data query
  mysqlConnection.query(dataQuery, finalParams, (err, results) => {
    if (err) {
      console.error("❌ Data Query Error:", err.sqlMessage || err.message);
      console.error("Query:", dataQuery);
      console.error("Params:", finalParams);
      return callback(err);
    }

    const enrichedResults = results.map((sample) => ({
      ...sample,
      locationids: [sample.room_number, sample.freezer_id, sample.box_id]
        .filter(Boolean)
        .join("-"),
    }));

    // Execute count query
    mysqlConnection.query(countQuery, countParams, (err, countResults) => {
      if (err) {
        console.error("❌ Count Query Error:", err.sqlMessage || err.message);
        return callback(err);
      }

      const totalCount = countResults[0].totalCount;
      callback(null, { samples: enrichedResults, totalCount });
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

// Function to get samples with price > 0 in sample visibility page
const getBiobankVisibilitySamples = (user_account_id, page, pageSize, searchField, searchValue, callback) => {
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

    const enrichedResults = results.map(sample => ({
      ...sample,
      locationids: [sample.room_number, sample.freezer_id, sample.box_id].filter(Boolean).join("-"),
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

  const query = 'SELECT price FROM sample WHERE diseasename = ?';

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
  getBiobankSamples,
  postSamplePrice,
  getQuarantineStock,
  getBiobankVisibilitySamples,
  UpdateSampleStatus,
  getPrice
};
