const mysqlConnection = require("../config/db");

const createSampleReceiveTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS samplereceive (
      id INT AUTO_INCREMENT PRIMARY KEY,
      receiverName VARCHAR(255) NOT NULL,
      ReceivedByCollectionSite INT NOT NULL,
      ReceiveDate DATE DEFAULT (CURRENT_DATE),
      sampleID VARCHAR(36) NOT NULL,
      status ENUM('Returned', 'Received') NOT NULL DEFAULT 'Received',
      FOREIGN KEY (sampleID) REFERENCES sample(id),
      FOREIGN KEY (ReceivedByCollectionSite) REFERENCES user_account(id) ON DELETE CASCADE
    )
  `;

  mysqlConnection.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating sample receive table:", err);
    } else {
      console.log("Sample receive table created or already exists.");
    }
  });
};

// Function to get all samples with 'In Stock' status


const getSampleReceiveInTransit = (
  staffUserId,
  page,
  pageSize,
  searchField,
  searchValue,
  callback
) => {
  const offset = (page - 1) * pageSize;
  let searchClause = "";

  if (searchField && searchValue) {
    if (searchField === "quantity") {
      searchClause = ` AND sd.TotalQuantity LIKE ?`;
    } else {
      searchClause = ` AND ${searchField} LIKE ?`;
    }
  }

  const siteQuery = `SELECT collectionsite_id FROM collectionsitestaff WHERE user_account_id = ?`;

  mysqlConnection.query(siteQuery, [staffUserId], (siteErr, siteResults) => {
    if (siteErr || !siteResults.length) {
      return callback({ error: "Error fetching collection site" }, null);
    }

    const collectionSiteId = siteResults[0].collectionsite_id;

    const staffQuery = `SELECT user_account_id FROM collectionsitestaff WHERE collectionsite_id = ?`;
    mysqlConnection.query(staffQuery, [collectionSiteId], (staffErr, staffResults) => {
      if (staffErr || !staffResults.length) {
        return callback({ error: "No staff found for this collection site" }, null);
      }

      const userIds = staffResults.map(row => row.user_account_id);
      const placeholders = userIds.map(() => '?').join(',');

      const mainQuery = `
        SELECT DISTINCT
          s.id, s.masterID, s.donorID, s.diseasename, s.age, s.gender,s.volume,
          s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType,
          s.CountryOfCollection, s.price, s.SamplePriceCurrency,
          s.VolumeUnit, s.SampleTypeMatrix, s.SmokingStatus,
          s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting,
          s.InfectiousDiseaseResult, s.FreezeThawCycles,
          s.DateOfSampling, s.ConcurrentMedicalConditions,
          s.ConcurrentMedications, s.TestResult, s.TestResultUnit, s.TestMethod,
          s.TestKitManufacturer, s.TestSystem, s.TestSystemManufacturer,
          sr.ReceivedByCollectionSite, s.status, s.sample_visibility,
          CONCAT_WS('-', s.room_number, s.freezer_id, s.box_id) AS locationids,
          s.phoneNumber,
          COALESCE(sd.TotalQuantity, 0) AS quantity
        FROM sample s
        LEFT JOIN samplereceive sr ON sr.sampleID = s.id
        LEFT JOIN (
          SELECT 
            sampleID,
            SUM(CASE WHEN status = 'In Stock' THEN Quantity ELSE 0 END) -
            SUM(CASE WHEN status = 'Lost' THEN Quantity ELSE 0 END) AS TotalQuantity
          FROM sampledispatch
          WHERE TransferTo = ?
          GROUP BY sampleID
        ) sd ON sd.sampleID = s.id
        WHERE sr.ReceivedByCollectionSite IN (${placeholders})
          AND s.status = 'In Stock'
          AND sr.sampleID IS NOT NULL
          AND sr.status = 'Received'
          ${searchClause}
        ORDER BY s.id
        LIMIT ? OFFSET ?
      `;

      const queryParams = [collectionSiteId, ...userIds];
      if (searchField && searchValue) queryParams.push(`%${searchValue}%`);
      queryParams.push(pageSize, offset);

      mysqlConnection.query(mainQuery, queryParams, (err, results) => {
        if (err) return callback({ error: "Error fetching samples" }, null);

        const countQuery = `
          SELECT COUNT(DISTINCT s.id) AS totalCount
          FROM sample s
          LEFT JOIN samplereceive sr ON sr.sampleID = s.id
          LEFT JOIN (
            SELECT 
              sampleID,
              SUM(CASE WHEN status = 'In Stock' THEN Quantity ELSE 0 END) -
              SUM(CASE WHEN status = 'Lost' THEN Quantity ELSE 0 END) AS TotalQuantity
            FROM sampledispatch
            WHERE TransferTo = ?
            GROUP BY sampleID
          ) sd ON sd.sampleID = s.id
          WHERE sr.ReceivedByCollectionSite IN (${placeholders})
            AND s.status = 'In Stock'
            AND sr.sampleID IS NOT NULL
            AND s.id NOT IN (SELECT sampleID FROM samplereturn)
            ${searchClause}
        `;

        const countParams = [collectionSiteId, ...userIds];
        if (searchField && searchValue) countParams.push(`%${searchValue}%`);

        mysqlConnection.query(countQuery, countParams, (countErr, countResults) => {
          if (countErr) return callback({ error: "Error counting results" }, null);

          const totalCount = countResults[0].totalCount;
          const totalPages = Math.ceil(totalCount / pageSize);

          return callback(null, {
            samples: results,
            totalPages,
            currentPage: page,
            pageSize,
            totalCount,
          });
        });
      });
    });
  });
};



const createSampleReceive = (receiveData, sampleID, callback) => {
  const { receiverName, ReceivedByCollectionSite } = receiveData;
  const query = `
    INSERT INTO samplereceive (receiverName, ReceivedByCollectionSite, sampleID)
    VALUES (?, ?, ?)
  `;
  
  mysqlConnection.query(query, [receiverName, ReceivedByCollectionSite, sampleID], callback);
};

module.exports = {
  createSampleReceiveTable,
  getSampleReceiveInTransit,
  createSampleReceive,
};