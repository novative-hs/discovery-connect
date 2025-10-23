const mysqlConnection = require("../config/db");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../config/email");
const { decryptAndShort } = require("../config/encryptdecrptUtils");

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
  filters,
  callback
) => {
  const pageInt = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 50;
  const offset = (pageInt - 1) * pageSizeInt;

  let baseWhereShared = `sample.status = "In Stock" AND sample.is_deleted = FALSE`;
  let baseWhereOwn = `sample.status = "In Stock" AND sample.is_deleted = FALSE`;

  const paramsShared = [];
  const paramsOwn = [];

  // const likeValue = `%${filters?.toLowerCase()}%`;

  // Price filter
  if (priceFilter === "priceAdded") {
    baseWhereShared += ` AND sample.price IS NOT NULL AND sample.price > 0`;
    baseWhereOwn += ` AND sample.price IS NOT NULL AND sample.price > 0`;
  } else if (priceFilter === "priceNotAdded") {
    baseWhereShared += ` AND (sample.price IS NULL OR sample.price = 0)`;
    baseWhereOwn += ` AND (sample.price IS NULL OR sample.price = 0)`;
  }

  // Search filter (excluding masterID, handled later)
  Object.entries(filters).forEach(([field, value]) => {
    if (!value || field === "page" || field === "pageSize" || field === "priceFilter" || field === "searchField" || field === "searchValue") return;

    const likeValue = `%${value.toLowerCase()}%`;

    switch (field) {
      case "locationids":
        baseWhereShared += ` AND (LOWER(sample.room_number) LIKE ? OR LOWER(sample.freezer_id) LIKE ? OR LOWER(sample.box_id) LIKE ?)`;
        baseWhereOwn += ` AND (LOWER(sample.room_number) LIKE ? OR LOWER(sample.freezer_id) LIKE ? OR LOWER(sample.box_id) LIKE ?)`;
        paramsShared.push(likeValue, likeValue, likeValue);
        paramsOwn.push(likeValue, likeValue, likeValue);
        break;

      case "volume":
        baseWhereShared += `
          AND (
            LOWER(sample.VolumeUnit) = ? OR
            LOWER(sample.volume) LIKE ?
          )`;
        baseWhereOwn += `
          AND (
            LOWER(sample.VolumeUnit) = ? OR
            LOWER(sample.volume) LIKE ?
          )`;

        paramsShared.push(value.toLowerCase(), `%${value.toLowerCase()}%`);
        paramsOwn.push(value.toLowerCase(), `%${value.toLowerCase()}%`);
        break;

      case "price":
        baseWhereShared += ` AND CONCAT_WS(' ', sample.price, sample.SamplePriceCurrency) LIKE ?`;
        baseWhereOwn += ` AND CONCAT_WS(' ', sample.price, sample.SamplePriceCurrency) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "gender":
        if (!isNaN(value)) {
          // If value is a number, treat as age
          baseWhereShared += ` AND sample.age = ?`;
          baseWhereOwn += ` AND sample.age = ?`;
          paramsShared.push(Number(value));
          paramsOwn.push(Number(value));
        } else {
          // Otherwise treat as gender
          baseWhereShared += ` AND LOWER(sample.gender) = ?`;
          baseWhereOwn += ` AND LOWER(sample.gender) = ?`;
          paramsShared.push(value.toLowerCase());
          paramsOwn.push(value.toLowerCase());
        }
        break;




      case "date_from":
        baseWhereShared += ` AND sample.created_at >= ?`;
        baseWhereOwn += ` AND sample.created_at >= ?`;
        paramsShared.push(value + " 00:00:00");
        paramsOwn.push(value + " 00:00:00");
        break;

      case "date_to":
        baseWhereShared += ` AND sample.created_at <= ?`;
        baseWhereOwn += ` AND sample.created_at <= ?`;
        paramsShared.push(value + " 23:59:59");
        paramsOwn.push(value + " 23:59:59");
        break;

      case "TestResult":
        baseWhereShared += `
        AND (
          CONCAT(sample.TestResult, ' ', IFNULL(sample.TestResultUnit, '')) LIKE ?
        )
      `;
        baseWhereOwn += `
        AND (
          CONCAT(sample.TestResult, ' ', IFNULL(sample.TestResultUnit, '')) LIKE ?
        )
      `;
        paramsShared.push(`%${value}%`);
        paramsOwn.push(`%${value}%`);
        break;



      case "CollectionSiteName":
        baseWhereShared += ` AND LOWER(collectionsite.CollectionSiteName) LIKE ?`;
        paramsShared.push(likeValue);
        break;
      case "visibility":
        baseWhereShared += ` AND LOWER(sample.sample_visibility) = ?`;
        paramsShared.push(value.toLowerCase());
        baseWhereOwn += ` AND LOWER(sample.sample_visibility) = ?`;
        paramsOwn.push(value.toLowerCase());
        break;   // <-- missing earlier

      default:
        baseWhereShared += ` AND LOWER(sample.\`${field}\`) LIKE ?`;
        paramsShared.push(likeValue);
        baseWhereOwn += ` AND LOWER(sample.\`${field}\`) LIKE ?`;
        paramsOwn.push(likeValue);
        break;
    }
  });


  const sharedSamplesQuery = `
    SELECT sample.*, collectionsite.CollectionSiteName
    FROM sample
    JOIN collectionsitestaff ON sample.user_account_id = collectionsitestaff.user_account_id
    JOIN collectionsite ON collectionsitestaff.collectionsite_id = collectionsite.id
    WHERE ${baseWhereShared} AND sample.user_account_id != ?
  `;

  const ownSamplesQuery = `
    SELECT sample.*, NULL AS CollectionSiteName
    FROM sample
    WHERE ${baseWhereOwn} AND sample.user_account_id = ?
  `;

  const combinedQuery = `
    SELECT * FROM (
      ${sharedSamplesQuery}
      UNION ALL
      ${ownSamplesQuery}
    ) AS merged_samples
    ORDER BY created_at DESC
  `;

  const finalParams = [...paramsShared, user_account_id, ...paramsOwn, user_account_id];

  mysqlConnection.query(combinedQuery, finalParams, (err, results) => {
    if (err) {
      console.error("❌ Query Error:", err.sqlMessage || err.message);
      return callback(err);
    }

    // Enrich and decrypt masterID
    const enrichedResults = results.map(sample => {
      let shortMasterID = null;
      try {
        shortMasterID = decryptAndShort(sample.masterID);
      } catch (e) {
        console.error("⚠️ Decryption error for sample ID", sample.id);
      }

      return {
        ...sample,
        locationids: [sample.room_number, sample.freezer_id, sample.box_id].filter(Boolean).join("-"),
        masterID: shortMasterID,
      };
    });

    // If masterID filter is used, apply it after decryption

    const filteredResults = enrichedResults;

    const totalCount = filteredResults.length;
    const paginatedSamples = filteredResults.slice(offset, offset + pageSizeInt);

    callback(null, {
      samples: paginatedSamples,
      totalCount,
    });
  });
};


const getBiobankSamplesPooled = (
  user_account_id,
  page,
  pageSize,
  priceFilter,
  filters,
  callback
) => {
  const pageInt = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 50;
  const offset = (pageInt - 1) * pageSizeInt;

  let baseWhereShared = `sample.status = "Pooled" AND sample.is_deleted = FALSE`;
  let baseWhereOwn = `sample.status = "Pooled" AND sample.is_deleted = FALSE`;
  const paramsShared = [];
  const paramsOwn = [];

  // Price filter
  if (priceFilter === "priceAdded") {
    baseWhereShared += ` AND sample.price IS NOT NULL AND sample.price > 0`;
    baseWhereOwn += ` AND sample.price IS NOT NULL AND sample.price > 0`;
  } else if (priceFilter === "priceNotAdded") {
    baseWhereShared += ` AND (sample.price IS NULL OR sample.price = 0)`;
    baseWhereOwn += ` AND (sample.price IS NULL OR sample.price = 0)`;
  }

  Object.entries(filters).forEach(([field, value]) => {
    if (!value || value.trim() === '') return;

    const likeValue = `%${value.toLowerCase()}%`;

    switch (field) {
      case "PatientName":
        baseWhereShared += ` AND LOWER(sample.PatientName) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.PatientName) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "PatientLocation":
        baseWhereShared += ` AND LOWER(sample.PatientLocation) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.PatientLocation) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "MRNumber":
        baseWhereShared += ` AND LOWER(sample.MRNumber) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.MRNumber) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "Analyte":
        baseWhereShared += ` AND LOWER(sample.Analyte) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.Analyte) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "samplemode":
        baseWhereShared += ` AND LOWER(sample.samplemode) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.samplemode) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "gender":
        baseWhereShared += ` AND LOWER(TRIM(sample.gender)) = ?`;
        baseWhereOwn += ` AND LOWER(TRIM(sample.gender)) = ?`;
        paramsShared.push(value.toLowerCase().trim());
        paramsOwn.push(value.toLowerCase().trim());
        break;


      case "age":
        baseWhereShared += ` AND CAST(sample.age AS CHAR) LIKE ?`;
        baseWhereOwn += ` AND CAST(sample.age AS CHAR) LIKE ?`;
        paramsShared.push(`%${value}%`);
        paramsOwn.push(`%${value}%`);
        break;

      case "locationids":
        baseWhereShared += ` AND (LOWER(sample.room_number) LIKE ? OR LOWER(sample.freezer_id) LIKE ? OR LOWER(sample.box_id) LIKE ?)`;
        baseWhereOwn += ` AND (LOWER(sample.room_number) LIKE ? OR LOWER(sample.freezer_id) LIKE ? OR LOWER(sample.box_id) LIKE ?)`;
        paramsShared.push(likeValue, likeValue, likeValue);
        paramsOwn.push(likeValue, likeValue, likeValue);
        break;

      case "TestResult":
        baseWhereShared += ` AND LOWER(CONCAT_WS(' ', sample.TestResult, sample.TestResultUnit)) LIKE ?`;
        baseWhereOwn += ` AND LOWER(CONCAT_WS(' ', sample.TestResult, sample.TestResultUnit)) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;

      case "volume":
        baseWhereShared += ` AND (LOWER(CONCAT_WS(' ', sample.volume, sample.VolumeUnit)) LIKE ? OR LOWER(sample.VolumeUnit) = ?)`;
        baseWhereOwn += ` AND (LOWER(CONCAT_WS(' ', sample.volume, sample.VolumeUnit)) LIKE ? OR LOWER(sample.VolumeUnit) = ?)`;
        paramsShared.push(likeValue, value.toLowerCase());
        paramsOwn.push(likeValue, value.toLowerCase());
        break;

      default:
        baseWhereShared += ` AND LOWER(sample.\`${field}\`) LIKE ?`;
        baseWhereOwn += ` AND LOWER(sample.\`${field}\`) LIKE ?`;
        paramsShared.push(likeValue);
        paramsOwn.push(likeValue);
        break;
    }
  });

  const sharedSamplesQuery = `
    SELECT sample.*, collectionsite.CollectionSiteName
    FROM sample
    JOIN collectionsitestaff ON sample.user_account_id = collectionsitestaff.user_account_id
    JOIN collectionsite ON collectionsitestaff.collectionsite_id = collectionsite.id
    WHERE ${baseWhereShared} AND sample.user_account_id != ?
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
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS totalCount FROM (
      ${sharedSamplesQuery}
      UNION ALL
      ${ownSamplesQuery}
    ) AS countCombined
  `;

  const finalParams = [...paramsShared, user_account_id, ...paramsOwn, user_account_id, pageSizeInt, offset];
  const countParams = [...paramsShared, user_account_id, ...paramsOwn, user_account_id];

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

// Helper to use async/await with MySQL
function queryAsync(conn, sql, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

const postSamplePrice = (sampleData, callback) => {
  mysqlConnection.getConnection((err, connection) => {
    if (err) return callback(err, null);

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        return callback(err, null);
      }

      try {
        // 1. Update sample
        await queryAsync(
          connection,
          `UPDATE sample SET price = ?, SamplePriceCurrency = ? WHERE id = ?`,
          [sampleData.price, sampleData.SamplePriceCurrency, sampleData.sampleId]
        );

        // 2. Insert into sample_history
        await queryAsync(
          connection,
          `INSERT INTO sample_history (sample_id, action_type) VALUES (?, 'update')`,
          [sampleData.sampleId]
        );

        // 3. Check pending quotes
        const quoteResults = await queryAsync(
          connection,
          `
          SELECT qr.id AS quote_id, ua.email, r.ResearcherName
          FROM quote_requests qr
          JOIN researcher r ON qr.researcher_id = r.user_account_id
          JOIN user_account ua ON ua.id = r.user_account_id
          WHERE qr.sample_id = ? AND qr.status = 'pending'
          `,
          [sampleData.sampleId]
        );

        if (quoteResults.length > 0) {
          const quoteIds = quoteResults.map((q) => q.quote_id);

          // Build dynamic fields
          let updateFields = [];
          let updateValues = [];

          if (sampleData.charges?.tax) {
            if (sampleData.charges.tax.type === "percent") {
              updateFields.push("tax_percent = ?");
            } else {
              updateFields.push("tax_amount = ?");
            }
            updateValues.push(sampleData.charges.tax.value);
          }

          if (sampleData.charges?.platform) {
            if (sampleData.charges.platform.type === "percent") {
              updateFields.push("platform_percent = ?");
            } else {
              updateFields.push("platform_amount = ?");
            }
            updateValues.push(sampleData.charges.platform.value);
          }

          if (sampleData.charges?.freight) {
            if (sampleData.charges.freight.type === "percent") {
              updateFields.push("freight_percent = ?");
            } else {
              updateFields.push("freight_amount = ?");
            }
            updateValues.push(sampleData.charges.freight.value);
          }

          // Always update status
          updateFields.push("status = 'priced'");
          updateValues.push(quoteIds);

          await queryAsync(
            connection,
            `UPDATE quote_requests SET ${updateFields.join(", ")} WHERE id IN (?)`,
            updateValues
          );

          // ✅ Commit transaction (DB done)
          await queryAsync(connection, "COMMIT");
          connection.release();

          // ✅ Handle email asynchronously (doesn't block API)
          const firstQuote = quoteResults[0];
          const emailBody = `
            <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333;">Dear ${firstQuote.ResearcherName},</p>
                <p style="font-size: 15px; color: #555;">
                  The price for one of your requested samples has been updated.
                </p>
                <p style="font-size: 15px; color: #555;">
                  You can now proceed to order this sample from your dashboard.
                </p>
                <p style="font-size: 15px; color: #333; margin-top: 20px;">
                  Regards,<br>
                  <strong>Biobank Team</strong>
                </p>
              </div>
            </div>
          `;

          // fire-and-forget email
          setImmediate(() => {
            sendEmail(firstQuote.email, "Sample Price Updated - Ready to Order", emailBody)
              .then(() => console.log("✅ Email sent"))
              .catch((e) => console.error("❌ Email failed:", e));
          });

          return callback(null, { id: sampleData.sampleId });
        } else {
          // ✅ No pending quotes
          await queryAsync(connection, "COMMIT");
          connection.release();
          return callback(null, { id: sampleData.sampleId });
        }
      } catch (err) {
        connection.rollback(() => {
          connection.release();
          callback(err, null);
        });
      }
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
      console.error("❌ Error updating sample:", err);
      return callback(err, null);
    }

    // ✅ Insert into sample_history after update
    const historyQuery = `
      INSERT INTO sample_history (sample_id, action_type)
      VALUES (?, 'update')
    `;

    mysqlConnection.query(historyQuery, [id], (historyErr, historyResult) => {
      if (historyErr) {
        console.error("❌ Error inserting into sample_history:", historyErr);
        return callback(historyErr, null);
      }

      callback(null, { message: "✅ Sample status updated successfully and history recorded." });
    });
  });
};


const getQuarantineStock = (callback) => {
  const query = `SELECT * FROM sample WHERE status =  "Quarantine" and is_deleted = false`;

  mysqlConnection.query(query, (err, results) => {
    if (err) return callback(err, null);
    return callback(null, results);
  });
};

const getPriceRequest = (callback) => {
  const query = `
SELECT 
      qr.id AS quote_request_id,
      qr.sample_id,
      qr.tax_amount,
      qr.tax_percent,
      qr.platform_amount,
      qr.platform_percent,
      qr.freight_amount,
      qr.freight_percent,
      qr.status,
      qr.quantity,
      s.masterID,
      s.id,
      s.analyte,
      s.age,
      s.gender,
      s.TestResult,
      s.price,
      s.volume,
      s.VolumeUnit,
      s.SamplePriceCurrency,
      s.TestResultUnit,
      r.ResearcherName,
      r.phoneNumber,
      r.fullAddress,

      c.name AS city_name,
      d.name AS district_name,
      co.name AS country_name,

      o.organizationname AS OrganizationName

    FROM quote_requests qr
    LEFT JOIN sample s ON qr.sample_id = s.id
    LEFT JOIN researcher r ON r.user_account_id = qr.researcher_id
    LEFT JOIN organization o ON r.nameofOrganization = o.id
    LEFT JOIN city c ON r.city = c.id
    LEFT JOIN district d ON r.district = d.id
    LEFT JOIN country co ON r.country = co.id
    WHERE s.status = "In Stock" 
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err){
    return callback(err, null);
    }

    const transformedResults = results.map(sample => ({
      ...sample,
      masterID: decryptAndShort(sample.masterID)  // Apply your transformation
    }));
    return callback(null, transformedResults);
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
  getPrice,
  getBiobankSamplesPooled,
  getPriceRequest
};
