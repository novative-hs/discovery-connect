
const mysqlConnection = require("../config/db");
const fs = require('fs');
const crypto = require('crypto');
const { encrypt, decrypt, decryptAndShort } = require("../config/encryptdecrptUtils");

const { v4: uuidv4 } = require('uuid');
const path = require('path');
// Function to create the sample table
const createSampleTable = () => {
  const sampleTable = `
    CREATE TABLE IF NOT EXISTS sample (
        id VARCHAR(36) PRIMARY KEY,
        MRNumber VARCHAR(50),
        masterID VARCHAR(36),
        user_account_id INT,
        PatientName VARCHAR(100),
        PatientLocation VARCHAR(100),
        Analyte VARCHAR(100),
        age INT,
        gender VARCHAR(10),
        phoneNumber VARCHAR(15),
        price FLOAT,
        SamplePriceCurrency VARCHAR(255),
        quantity FLOAT,
        quantity_allocated INT,
        volume DOUBLE,
        VolumeUnit VARCHAR(20),
        room_number INT,
        freezer_id INT,
        box_id INT,
        finalConcentration VARCHAR(20),
        ethnicity VARCHAR(50),
        samplecondition VARCHAR(100),
        storagetemp VARCHAR(255),
        ContainerType VARCHAR(50),
        CountryOfCollection VARCHAR(50),
        SampleTypeMatrix VARCHAR(100),
        SmokingStatus VARCHAR(50),
        AlcoholOrDrugAbuse VARCHAR(50),
        InfectiousDiseaseTesting VARCHAR(100),
        InfectiousDiseaseResult VARCHAR(100),
        FreezeThawCycles VARCHAR(50), 
        DateOfSampling VARCHAR(50),
        ConcurrentMedicalConditions VARCHAR(50), 
        ConcurrentMedications VARCHAR(50),
        TestResult VARCHAR(100),
        TestResultUnit VARCHAR(255),
        TestMethod VARCHAR(100),
        TestKitManufacturer VARCHAR(50),
        TestSystem VARCHAR(50),
        TestSystemManufacturer VARCHAR(50),
        sample_visibility ENUM('Public', 'Non-Public') DEFAULT 'Non-Public',
         status ENUM('In Stock', 'In Transit', 'Quarantine','Pooled') NOT NULL DEFAULT 'In Stock',
         reserved BOOLEAN DEFAULT FALSE,
        samplemode VARCHAR(30) DEFAULT 'Individual',
        logo LONGBLOB,
        samplepdf LONGBLOB NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;

  mysqlConnection.query(sampleTable, (err, results) => {
    if (err) {
      console.error("Error creating sample table: ", err);
    } else {
      console.log("Sample table created or already exists");
    }
  });
};
const createPoolSampleTable = () => {
  const poolsampleTable = `
    CREATE TABLE IF NOT EXISTS poolsample (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sample_id VARCHAR(36),
        poolsample_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE,
        FOREIGN KEY (poolsample_id) REFERENCES sample(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(poolsampleTable, (err, results) => {
    if (err) {
      console.error("❌ Error creating poolsample table:", err);
    } else {
      console.log("✅ Poolsample table created or already exists");
    }
  });
};
const createPriceRequest = () => {
  const createrequesttable = `
  CREATE TABLE quote_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  researcher_id INT,
  sample_id VARCHAR(36),
  status ENUM('pending', 'priced') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`
  mysqlConnection.query(createrequesttable, (err, results) => {
    if (err) {
      console.error("❌ Error creating request table:", err);
    } else {
      console.log("✅ Request table created or already exists");
    }
  });

}

// Function to get all samples with 'In Stock' status
const getSamples = (user_account_id, page, pageSize, searchField, searchValue, callback) => {
  const userId = parseInt(user_account_id, 10);
  const pageInt = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 50;
  const offset = (pageInt - 1) * pageSizeInt;

  if (isNaN(userId)) {
    return callback(new Error("Invalid user_account_id"), null);
  }

  const siteQuery = `SELECT collectionsite_id FROM collectionsitestaff WHERE user_account_id = ?`;

  mysqlConnection.query(siteQuery, [userId], (err, siteResult) => {
    if (err || siteResult.length === 0) {
      return callback(err || new Error("Collection site not found"), null);
    }

    const collectionsite_id = siteResult[0].collectionsite_id;

    let searchClause = "";
    const searchParams = [];

    const likeValue = `%${searchValue?.toLowerCase() || ""}%`;

    if (searchField && searchValue) {
      switch (searchField) {
        case "locationids":
          searchClause = ` AND (LOWER(s.room_number) LIKE ? OR LOWER(s.freezer_id) LIKE ? OR LOWER(s.box_id) LIKE ?)`;
          searchParams.push(likeValue, likeValue, likeValue);
          break;

        case "price":
          searchClause = ` AND LOWER(CONCAT_WS(' ', s.price, s.SamplePriceCurrency)) LIKE ?`;
          searchParams.push(likeValue);
          break;

        case "volume":
          searchClause = ` AND LOWER(CONCAT_WS(' ', s.volume, s.VolumeUnit)) LIKE ?`;
          searchParams.push(likeValue);
          break;

        case "TestResult":
          searchClause = ` AND LOWER(CONCAT_WS(' ', s.TestResult, s.TestResultUnit)) LIKE ?`;
          searchParams.push(likeValue);
          break;

        case "gender":
        case "sample_visibility":
          searchClause = ` AND LOWER(s.${searchField}) LIKE ?`;
          searchParams.push(`${searchValue.toLowerCase()}%`);
          break;

        default:
          searchClause = ` AND LOWER(s.${searchField}) LIKE ?`;
          searchParams.push(likeValue);
          break;
      }
    }

    const dataQuery = `
      SELECT s.*
      FROM sample s
      JOIN user_account ua ON s.user_account_id = ua.id
      JOIN collectionsitestaff cs ON ua.id = cs.user_account_id
      WHERE cs.collectionsite_id = ?
        AND s.status = 'In Stock'
        AND s.is_deleted = FALSE
        AND ua.accountType = 'CollectionSitesStaff'
        ${searchClause}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM sample s
      JOIN user_account ua ON s.user_account_id = ua.id
      JOIN collectionsitestaff cs ON ua.id = cs.user_account_id
      WHERE cs.collectionsite_id = ?
        AND s.status = 'In Stock'
        AND s.is_deleted = FALSE
        AND ua.accountType = 'CollectionSitesStaff'
        ${searchClause}
    `;

    const dataParams = [collectionsite_id, ...searchParams, pageSizeInt, offset];
    const countParams = [collectionsite_id, ...searchParams];

    mysqlConnection.query(dataQuery, dataParams, (err, results) => {
      if (err) return callback(err);

      const enrichedResults = results.map(sample => ({
        ...sample,
        locationids: [sample.room_number, sample.freezer_id, sample.box_id].filter(Boolean).join('-'),
        masterID: sample.masterID ? decryptAndShort(sample.masterID) : null,
      }));

      mysqlConnection.query(countQuery, countParams, (err, countResult) => {
        if (err) return callback(err);

        callback(null, {
          results: enrichedResults,

          totalCount: countResult[0].totalCount,
        });
      });
    });
  });
};



const getAllSamples = (callback) => {
  const query = `
    SELECT 
      s.*,
      cs.CollectionSiteName AS Name,
      bb.Name AS BiobankName,
      c.name AS CityName,
      d.name AS DistrictName,
      a.image AS analyteImage
    FROM 
      sample s
    LEFT JOIN 
      collectionsitestaff css ON s.user_account_id = css.user_account_id
    LEFT JOIN 
      collectionsite cs ON css.collectionsite_id = cs.id
    LEFT JOIN 
      biobank bb ON s.user_account_id = bb.id
    LEFT JOIN 
      city c ON cs.city = c.id
    LEFT JOIN 
      district d ON cs.district = d.id
    LEFT JOIN 
      analyte a ON a.name = s.Analyte
    WHERE 
      s.status = 'In Stock' 
      AND s.Quantity > 0
      AND sample_visibility = "Public"
  `;

  mysqlConnection.query(query, (err, results) => {
    if (err) return callback(err, null);

    const updatedResults = results.map(sample => {
      // Decrypt masterID
      sample.masterID = sample.masterID ? decryptAndShort(sample.masterID) : null;

      // Handle analyte image URL
      if (sample.analyteImage) {
        sample.imageUrl = sample.analyteImage.startsWith('/')
          ? sample.analyteImage
          : `/${sample.analyteImage}`;
      } else {
        sample.imageUrl = null; // fallback or null
      }

      delete sample.analyteImage; // Remove raw field if needed

      return sample;
    });

    callback(null, updatedResults);
  });
};


const getResearcherSamples = (userId, callback) => {
  const query = `
    SELECT
      s.*,
      sm.Analyte,
      sm.age,
      sm.gender,
      sm.ethnicity,
      sm.samplecondition,
      sm.storagetemp,
      sm.ContainerType,
      sm.CountryOfCollection,
      country.name AS CountryName,
      sm.price,
      sm.SamplePriceCurrency,
      sm.SampleTypeMatrix,
      sm.SmokingStatus,
      sm.AlcoholOrDrugAbuse,
      sm.InfectiousDiseaseTesting,
      sm.InfectiousDiseaseResult,
      sm.FreezeThawCycles,
      sm.DateOfSampling,
      sm.ConcurrentMedicalConditions,
      sm.ConcurrentMedications,
      sm.TestResult,
      sm.TestResultUnit,
      sm.TestMethod,
      sm.TestKitManufacturer,
      sm.TestSystem,
      sm.TestSystemManufacturer,
      sm.status,
      sm.sample_visibility,
      sm.logo,
      cs.CollectionSiteName,
      bb.Name AS BiobankName,
      c.name AS CityName,
      d.name AS DistrictName,
      p.payment_type AS payment_method,
      p.payment_status AS payment_status,
      s.quantity AS orderquantity,
      ra.technical_admin_status,

      sm.masterID,

      CASE
          WHEN COUNT(ca.committee_status) = 0 THEN NULL
          WHEN SUM(CASE WHEN ca.committee_status = 'refused' THEN 1 ELSE 0 END) > 0 THEN 'rejected'
          WHEN SUM(CASE WHEN ca.committee_status = 'UnderReview' THEN 1 ELSE 0 END) > 0 THEN 'UnderReview'
          ELSE 'accepted'
      END AS committee_status

    FROM cart s
    JOIN user_account ua ON s.user_id = ua.id
    LEFT JOIN sample sm ON s.sample_id = sm.id
    LEFT JOIN collectionsitestaff css ON sm.user_account_id = css.user_account_id
    LEFT JOIN collectionsite cs ON cs.id = css.collectionsite_id
    LEFT JOIN biobank bb ON sm.user_account_id = bb.id
    LEFT JOIN city c ON cs.city = c.id
    LEFT JOIN district d ON cs.district = d.id
    LEFT JOIN country ON sm.CountryOfCollection = country.id
    JOIN payment p ON s.payment_id = p.id
    LEFT JOIN technicaladminsampleapproval ra ON s.id = ra.cart_id
    LEFT JOIN committeesampleapproval ca ON s.id = ca.cart_id

    WHERE s.user_id = ?

    GROUP BY s.id, sm.id, cs.id, bb.id, c.id, d.id, country.id, ra.technical_admin_status

    ORDER BY s.id DESC;
  `;

  mysqlConnection.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, { error: "No samples found" });
    }

    // Decrypt masterID for each result
    const decryptedResults = results.map(sample => ({
      ...sample,
      masterID: sample.masterID ? decryptAndShort(sample.masterID) : null
    }));

    callback(null, decryptedResults);
  });
};


const getAllVolumnUnits = (name, callback) => {
  const query = 'SELECT id, quantity, volume, VolumeUnit FROM sample WHERE Analyte = ? and quantity>0';

  mysqlConnection.query(query, [name], (err, results) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      callback(err, null);
    } else {
      const grouped = {};

      results.forEach(({ id, quantity, volume, VolumeUnit }) => {
        const key = `${volume}_${VolumeUnit}`;
        if (!grouped[key]) {
          grouped[key] = {
            vol: volume,
            unit: VolumeUnit,
            quantity: 0,
            sampleIds: [],
          };
        }
        grouped[key].quantity += quantity;
        grouped[key].sampleIds.push(id);
      });

      callback(null, Object.values(grouped));
    }
  });
};

const getAllSampleinIndex = (analyte, limit, offset, filters, callback) => {
  let baseWhere = `Analyte = ? AND quantity > 0 AND sample_visibility = "Public" AND status = "In Stock"`;
  let queryParams = [analyte];

  const { ageMin, ageMax, gender, sampleType, smokingStatus, search, TestResult, exactAge, } = filters;
  if (exactAge !== null) {
    baseWhere += ` AND age = ?`;
    queryParams.push(exactAge);
  }
  else {
    if (ageMin !== null) {
      baseWhere += ` AND age >= ?`;
      queryParams.push(ageMin);
    }

    if (ageMax !== null) {
      baseWhere += ` AND age <= ?`;
      queryParams.push(ageMax);
    }
  }

  if (gender) {
    baseWhere += ` AND gender = ?`;
    queryParams.push(gender);
  }

  if (sampleType) {
    baseWhere += ` AND sampleType = ?`;
    queryParams.push(sampleType);
  }

  if (smokingStatus) {
    baseWhere += ` AND smokingStatus = ?`;
    queryParams.push(smokingStatus);
  }
  if (TestResult) {
    baseWhere += ` AND TestResult = ?`;
    queryParams.push(TestResult);
  }
  if (search) {
    baseWhere += ` AND (PatientName LIKE ? OR masterID LIKE ?)`;
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  const dataQuery = `SELECT * FROM sample WHERE ${baseWhere} LIMIT ? OFFSET ?`;
  const countQuery = `SELECT COUNT(*) AS total FROM sample WHERE ${baseWhere}`;

  queryParams.push(limit, offset);

  mysqlConnection.query(dataQuery, queryParams, (err, dataResults) => {
    if (err) {
      console.error("Database query error (data):", err);
      return callback(err, null);
    }

    const countParams = queryParams.slice(0, queryParams.length - 2); // exclude limit, offset

    mysqlConnection.query(countQuery, countParams, (err, countResults) => {
      if (err) {
        console.error("Database query error (count):", err);
        return callback(err, null);
      }

      const total = countResults[0].total;

      const modifiedResults = dataResults.map((sample) => {
        let safeMasterID = null;
        try {
          safeMasterID = sample.masterID
            ? decryptAndShort(sample.masterID)
            : null;
        } catch (err) {
          console.error("Error decrypting masterID:", sample.masterID, err.message);
          safeMasterID = null;
        }

        return {
          ...sample,
          masterID: safeMasterID,
        };
      });

      callback(null, {
        data: modifiedResults,
        total,
      });
    });
  });
};




const getAllCSSamples = (limit, offset, callback) => {
  const dataQuery = `
  SELECT 
  s.*,
  cs.CollectionSiteName,
  st.staffName AS CollectionSiteStaffName,
  bb.Name AS BiobankName,
  c.name AS CityName,
  d.name AS DistrictName,
  IFNULL(q.total_quantity, 0) AS total_quantity,
  IFNULL(q.total_allocated, 0) AS total_allocated,
  a.image AS analyteImage
FROM sample s
LEFT JOIN collectionsitestaff st ON s.user_account_id = st.user_account_id
LEFT JOIN collectionsite cs ON st.collectionsite_id = cs.id
LEFT JOIN biobank bb ON s.user_account_id = bb.user_account_id
LEFT JOIN city c ON cs.city = c.id
LEFT JOIN district d ON cs.district = d.id
LEFT JOIN analyte a ON a.name = s.Analyte
INNER JOIN (
  SELECT s1.Analyte, MAX(s1.id) AS id
  FROM sample s1
  INNER JOIN (
    SELECT Analyte, MIN(age) AS min_age
    FROM sample
    WHERE 
      status = 'In Stock'
      AND sample_visibility = 'Public'
      AND (quantity > 0 OR quantity_allocated > 0)
    GROUP BY Analyte
  ) AS min_age_per_analyte
  ON s1.Analyte = min_age_per_analyte.Analyte AND s1.age = min_age_per_analyte.min_age
  WHERE 
    s1.status = 'In Stock'
    AND s1.sample_visibility = 'Public'
    AND (s1.quantity > 0 OR s1.quantity_allocated > 0)
  GROUP BY s1.Analyte
) AS filtered ON s.id = filtered.id
LEFT JOIN (
  SELECT 
    Analyte, 
    SUM(quantity) AS total_quantity,
    SUM(quantity_allocated) AS total_allocated
  FROM sample
  WHERE 
    status = 'In Stock'
    AND sample_visibility = 'Public'
  GROUP BY Analyte
) AS q ON s.Analyte = q.Analyte
ORDER BY s.Analyte
LIMIT ? OFFSET ?;

`;


  const countQuery = `
    SELECT COUNT(DISTINCT Analyte) AS total
    FROM sample
    WHERE 
      status = 'In Stock' 
      AND sample_visibility = 'Public'
      AND (quantity > 0 OR quantity_allocated > 0)
  `;

  mysqlConnection.query(countQuery, (countErr, countResult) => {
    if (countErr) {
      console.error("❌ Count Query Error:", countErr);
      return callback(countErr, null);
    }

    const totalCount = countResult[0].total;

    mysqlConnection.query(dataQuery, [limit, offset], (dataErr, results) => {
      if (dataErr) {
        console.error("❌ Data Query Error:", dataErr);
        return callback(dataErr, null);
      }

      const updatedResults = results.map((sample) => {
        let imageUrl = null;

        if (sample.analyteImage) {
          imageUrl = sample.analyteImage.startsWith('/')
            ? sample.analyteImage
            : `/${sample.analyteImage}`;
        }

        return {
          ...sample,  // includes all s.* fields and joined fields
          imageUrl,
          masterID: sample.masterID ? decryptAndShort(sample.masterID) : null,
          total_stock: sample.total_quantity || 0,
          total_allocated: sample.total_allocated || 0,
          total_remaining: Math.max(0, (sample.total_quantity || 0) - (sample.total_allocated || 0))
        };
      });


      callback(null, { data: updatedResults, totalCount });
    });
  });
};


const updateReservedSample = (sampleId, status, callback) => {
  const updateQuery = "UPDATE sample SET reserved = ? WHERE id = ?";

  mysqlConnection.query(updateQuery, [status, sampleId], (err, result) => {
    if (err) return callback(err);

    // If status is 0, check quote_request status before deleting
    if (status === 0) {
      const checkStatusQuery = "SELECT status FROM quote_requests WHERE sample_id = ?";
      mysqlConnection.query(checkStatusQuery, [sampleId], (checkErr, rows) => {
        if (checkErr) return callback(checkErr);

        // If no record or status is not 'priced', delete
        if (rows.length === 0 || rows[0].status !== 'priced') {
          const deleteQuery = "DELETE FROM quote_requests WHERE sample_id = ?";
          mysqlConnection.query(deleteQuery, [sampleId], (deleteErr, deleteResult) => {
            if (deleteErr) return callback(deleteErr);
            return callback(null, { updateResult: result, deleteResult });
          });
        } else {
          // Status is 'priced', do not delete
          return callback(null, { updateResult: result, message: "Not deleted due to 'priced' status" });
        }
      });
    } else {
      // Reserved is not 0, just return update result
      return callback(null, { updateResult: result });
    }
  });
};



const getsingleSamples = (sampleId, callback) => {
  const query = 'SELECT * FROM sample WHERE id = ?';

  mysqlConnection.query(query, [sampleId], (err, results) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return callback(err, null);
    }

    if (results.length === 0) {
      return callback(null, null);
    }

    const sample = results[0];

    // 🔐 Decrypt master_id if it exists
    if (sample.masterID) {
      try {
        sample.masterID = decryptAndShort(sample.masterID);
      } catch (decryptionErr) {
        // console.error("Master ID Decryption Error:", decryptionErr);
        // You can optionally still return encrypted master_id or null
        sample.masterID = null;
      }
    }

    callback(null, sample);
  });
};



// Function to get a sample by its ID
const getSampleById = (id, callback) => {
  const query = 'SELECT * FROM sample WHERE id = ?';

  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    if (results.length > 0) {
      try {
        const sample = results[0];
        if (sample.masterID) {
          sample.masterID = decryptAndShort(sample.masterID);
        }
        return callback(null, [sample]); // keeping original structure: results in array
      } catch (decryptionErr) {
        // console.error("Decryption error:", decryptionErr);
        return callback(decryptionErr, null);
      }
    }

    // If no sample found
    return callback(null, []);
  });
};


const getPoolSampleDetails = (pooledSampleId, callback) => {

  const query = `
   SELECT s.*
FROM poolsample ps
JOIN sample s ON ps.sample_id = s.id
WHERE ps.poolsample_id = ?
GROUP BY s.id
  `;

  mysqlConnection.query(query, [pooledSampleId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching pooled sample details:", err);
      return callback(err, null);
    }

    return callback(null, results); // Array of samples part of this pool
  });
};


const createSample = (data, callback) => {
  const id = uuidv4(); // ID for the new sample (individual or pool)
  const rawmasterid = uuidv4()
  const masterID = encrypt(rawmasterid);

  let room_number = null;
  let freezer_id = null;
  let box_id = null;

  if (data.locationids) {
    const parts = data.locationids.split("-");
    room_number = parts[0] || null;
    freezer_id = parts[1] || null;
    box_id = parts[2] || null;
  }

  if (data.age === null || data.age === "") {
    data.age = null;
  }

  if (data.volume === "" || data.volume === null) {
    data.volume = 0; // or use null if you want to skip it
  }

  // ✅ Duplicate check only for Individual samples
  if (data.mode === "Individual") {
    const duplicateCheckQuery = `
      SELECT * FROM sample
      WHERE 
        LOWER(PatientName) = LOWER(?) AND
        age = ? AND
        gender = ? AND
        MRNumber = ? AND
        phoneNumber = ? AND
        TestResult = ? AND
        TestResultUnit = ? AND
        VolumeUnit = ? AND
        volume = ? AND
        SampleTypeMatrix = ? AND
        ContainerType = ? AND
        Analyte = ?
    `;

    const duplicateCheckValues = [
      data.patientname?.toLowerCase() || null,
      data.age,
      data.gender,
      data.MRNumber,
      data.phoneNumber,
      data.TestResult,
      data.TestResultUnit,
      data.VolumeUnit,
      data.volume,
      data.SampleTypeMatrix,
      data.ContainerType,
      data.Analyte,
    ];

    mysqlConnection.query(duplicateCheckQuery, duplicateCheckValues, (dupErr, dupResults) => {
      if (dupErr) {
        console.error("❌ Error checking duplicates:", dupErr);
        return callback(dupErr, null);
      }

      if (dupResults.length > 0) {
        return callback(new Error("Duplicate entry: This patient sample already exists."), null);
      }

      // Proceed with insert after duplicate check
      insertSample();
    });
  } else {
    // Directly insert for pooled sample
    insertSample();
  }

  // ✅ Extraction of insert logic to avoid duplication
  function insertSample() {
    const insertQuery = `
      INSERT INTO sample (
        id, MRNumber, samplemode, FinalConcentration, room_number, freezer_id, box_id, user_account_id, volume,
        PatientName, PatientLocation, Analyte, age, phoneNumber, gender, ethnicity, samplecondition, storagetemp,
        ContainerType, CountryOfCollection, price, SamplePriceCurrency, quantity, VolumeUnit, SampleTypeMatrix,
        SmokingStatus, AlcoholOrDrugAbuse, InfectiousDiseaseTesting, InfectiousDiseaseResult, FreezeThawCycles,
        DateOfSampling, ConcurrentMedicalConditions, ConcurrentMedications, TestResult, TestResultUnit, TestMethod,
        TestKitManufacturer, TestSystem, TestSystemManufacturer, status, logo, samplepdf
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      id,
      data.MRNumber,
      data.mode,
      data.finalConcentration,
      room_number,
      freezer_id,
      box_id,
      data.user_account_id,
      data.volume,
      data.patientname,
      data.patientlocation,
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
      data.VolumeUnit,
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
      data.samplepdf,
    ];

    mysqlConnection.query(insertQuery, insertValues, (err, results) => {
      if (err) {
        console.error("❌ Error inserting into sample:", err);
        return callback(err, null);
      }

      const updateQuery = `UPDATE sample SET masterID = ? WHERE id = ?`;
      mysqlConnection.query(updateQuery, [masterID, id], (err, updateResults) => {
        if (err) {
          console.error("❌ Error updating masterID:", err);
          return callback(err, null);
        }

        const historyQuery = `
          INSERT INTO sample_history (sample_id, user_account_id, action_type, updated_name)
          VALUES (?, ?, 'add', ?)
        `;
        mysqlConnection.query(historyQuery, [id, data.user_account_id || null, data.Analyte || null], (err, historyResults) => {
          if (err) {
            console.error("❌ Error inserting into sample_history:", err);
            return callback(err, null);
          }

          // ✅ Pool logic
          if ((data.mode !== "Individual") && data.poolSamples) {
            const poolSamplesArray = JSON.parse(data.poolSamples);

            const poolInsertValues = [];
            const valuePlaceholders = [];

            poolSamplesArray.forEach((sampleId) => {
              valuePlaceholders.push("(?, ?)");
              poolInsertValues.push(sampleId, id);
            });

            const poolInsertQuery = `
              INSERT INTO poolsample (sample_id, poolsample_id)
              VALUES ${valuePlaceholders.join(", ")}
            `;
            mysqlConnection.query(poolInsertQuery, poolInsertValues, (err, poolInsertResults) => {
              if (err) {
                console.error("❌ Error inserting into poolsample:", err);
                return callback(err, null);
              }
              const newStatus = data.alreadypooled === "Pooled" ? "AddtoPool" : "Pooled";

              const updateStatusQuery = `
      UPDATE sample SET status = ?, sample_visibility = 'Non-Public'
      WHERE id IN (?)
    `;

              mysqlConnection.query(updateStatusQuery, [newStatus, poolSamplesArray], (err, statusResults) => {
                if (err) {
                  console.error("❌ Error updating sample statuses:", err);
                  return callback(err, null);
                }

                return callback(null, { insertId: id, masterID });
              });
            });
          } else {
            return callback(null, { insertId: id, masterID });
          }
        });
      });
    });
  }
};

// Function to update a sample by its ID (in Collectionsite)
const updateSample = (id, data, file, callback) => {
  const logoFile = file;
  let room_number = null;
  let freezer_id = null;
  let box_id = null;

  // Parse locationids if provided
  if (data.locationids) {
    const parts = data.locationids.split("-");
    room_number = parts[0] && parts[0].toLowerCase() !== 'null' ? parts[0] : null;
    freezer_id = parts[1] && parts[1].toLowerCase() !== 'null' ? parts[1] : null;
    box_id = parts[2] && parts[2].toLowerCase() !== 'null' ? parts[2] : null;
  }


  const volume = data.volume === '' ? '' : data.volume;
  let age = data.age;
  if (age === '' || age === null || age === undefined) {
    age = null;
  } else {
    age = Number(age);
    if (isNaN(age)) {
      age = null;
    }
  }
  // Start with fields and values
  const fields = [
    'PatientName = ?', 'FinalConcentration=?', 'samplemode=?', 'PatientLocation = ?', 'room_number = ?', 'freezer_id = ?', 'box_id = ?', 'volume = ?',
    'Analyte = ?', 'age = ?', 'phoneNumber = ?', 'gender = ?', 'ethnicity = ?',
    'samplecondition = ?', 'storagetemp = ?', 'ContainerType = ?', 'CountryOfCollection = ?',
    'quantity = ?', 'VolumeUnit = ?', 'SampleTypeMatrix = ?', 'SmokingStatus = ?',
    'AlcoholOrDrugAbuse = ?', 'InfectiousDiseaseTesting = ?', 'InfectiousDiseaseResult = ?',
    'FreezeThawCycles = ?', 'DateOfSampling = ?', 'ConcurrentMedicalConditions = ?',
    'ConcurrentMedications = ?', 'TestResult = ?', 'TestResultUnit = ?', 'TestMethod = ?', 'TestKitManufacturer = ?', 'TestSystem = ?',
    'TestSystemManufacturer = ?', 'status = ?', 'samplepdf = ?'
  ];

  const values = [
    data.patientname, data.finalConcentration, data.mode, data.patientlocation, room_number, freezer_id, box_id, volume, data.Analyte, age, data.phoneNumber, data.gender, data.ethnicity, data.samplecondition, data.storagetemp, data.ContainerType, data.CountryOfCollection, data.quantity, data.VolumeUnit, data.SampleTypeMatrix, data.SmokingStatus, data.AlcoholOrDrugAbuse, data.InfectiousDiseaseTesting, data.InfectiousDiseaseResult, data.FreezeThawCycles, data.DateOfSampling, data.ConcurrentMedicalConditions, data.ConcurrentMedications, data.TestResult, data.TestResultUnit, data.TestMethod, data.TestKitManufacturer, data.TestSystem, data.TestSystemManufacturer, data.status, data.samplepdf
  ];

  // Add logo file if available
  if (file?.logo?.[0]?.buffer) {
    fields.push('logo = ?');
    values.push(file.logo[0].buffer);
  }

  if (file?.samplepdf?.[0]?.buffer) {
    fields.push('samplepdf = ?');
    values.push(file.samplepdf[0].buffer);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  const query = `
    UPDATE sample
    SET ${fields.join(', ')}
    WHERE id = ?
  `;
  values.push(id);

  mysqlConnection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating sample:', err);
      return callback(err, null);
    }

    if (result.affectedRows === 0) {
      console.warn('⚠️ No rows updated. Check if the sample ID exists.');
    }

    const historyQuery = `
      INSERT INTO sample_history (sample_id, user_account_id, action_type, updated_name)
      VALUES (?, ?, 'update', ?)
    `;

    mysqlConnection.query(historyQuery, [id, data.user_account_id || null, data.Analyte || null], (err, historyResults) => {
      if (err) {
        console.error('Error inserting into sample_history:', err);
        return callback(err, null);
      }
      callback(null, result);
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
const updatetestResultandUnit = (id, data, callback) => {
  const query = `
    UPDATE sample
    SET samplemode = ?, TestResult = ?, TestResultUnit = ?,samplepdf=?
    WHERE id = ?`;

  mysqlConnection.query(
    query,
    [data.mode, data.TestResult, data.TestResultUnit, data.samplepdf, id],
    (err, result) => {
      callback(err, result);
    }
  );
};




const deleteSample = (id, callback) => {
  mysqlConnection.getConnection((err, connection) => {
    if (err) return callback(err);

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      const getStatusQuery = 'SELECT status FROM sample WHERE id = ?';
      connection.query(getStatusQuery, [id], (err, results) => {
        if (err) return connection.rollback(() => { connection.release(); callback(err); });

        if (results.length === 0) {
          return connection.rollback(() => {
            connection.release();
            callback(null, { message: 'Sample not found.' });
          });
        }

        const status = results[0].status;

        if (status === 'Quarantine') {
          // Step 1: Delete from sampledispatch
          const deleteDispatchQuery = 'DELETE FROM sampledispatch WHERE sampleID = ?';
          connection.query(deleteDispatchQuery, [id], (err) => {
            if (err) return connection.rollback(() => { connection.release(); callback(err); });

            // Step 2: Delete from registrationadminsampleapproval
            const deleteApprovalQuery = `
              DELETE FROM technicaladminsampleapproval 
              WHERE cart_id IN (SELECT id FROM cart WHERE sample_id = ?)`;
            connection.query(deleteApprovalQuery, [id], (err) => {
              if (err) return connection.rollback(() => { connection.release(); callback(err); });

              // Step 3: Delete from cart
              const deleteCartQuery = 'DELETE FROM cart WHERE sample_id = ?';
              connection.query(deleteCartQuery, [id], (err) => {
                if (err) return connection.rollback(() => { connection.release(); callback(err); });

                // Step 4: Delete from sample
                const deleteSampleQuery = 'DELETE FROM sample WHERE id = ?';
                connection.query(deleteSampleQuery, [id], (err, result) => {
                  if (err) return connection.rollback(() => { connection.release(); callback(err); });

                  connection.commit((err) => {
                    if (err) return connection.rollback(() => { connection.release(); callback(err); });
                    connection.release();
                    return callback(null, { message: 'Sample and related records deleted.', result });
                  });
                });
              });
            });
          });
        } else {
          // Soft delete
          const softDeleteQuery = 'UPDATE sample SET is_deleted = TRUE WHERE id = ?';
          connection.query(softDeleteQuery, [id], (err, result) => {
            connection.release();
            if (err) return callback(err);
            return callback(null, { message: 'Sample soft-deleted.', result });
          });
        }
      });
    });
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

// Function to update a sample's status
const updateQuarantineSamples = (id, status, comment, callback) => {
  const updateQuery = `
    UPDATE sample
    SET status = ?
    WHERE id = ?`;

  const insertHistoryQuery = `
    INSERT INTO sample_history (sample_id, status, comments)
    VALUES (?, ?, ?)`;

  mysqlConnection.query(updateQuery, [status, id], (err, result) => {
    if (err) return callback(err);

    mysqlConnection.query(insertHistoryQuery, [id, status, comment], (historyErr, historyResult) => {
      if (historyErr) return callback(historyErr);
      callback(null, { updateResult: result, historyResult });
    });
  });
};

module.exports = {
  getFilteredSamples,
  createSampleTable,
  createPoolSampleTable,
  getSamples,
  getAllSamples,
  getResearcherSamples,
  getAllCSSamples,
  getSampleById,
  createSample,
  updateSample,
  updateSampleStatus,
  deleteSample,
  updateQuarantineSamples,
  getAllVolumnUnits,
  getAllSampleinIndex,
  getPoolSampleDetails,
  updatetestResultandUnit,
  createPriceRequest,
  getsingleSamples,
  updateReservedSample
};