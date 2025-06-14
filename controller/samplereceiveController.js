const mysqlConnection = require("../config/db");
const sampleReceiveModel = require("../models/samplereceiveModel");

// Controller for creating the sample receive table
const createSampleReceiveTable = (req, res) => {
  sampleReceiveModel.createSampleReceiveTable();
  res
    .status(200)
    .json({ message: "Sample receive table creation process started" });
};

// Controller to get all sample receivees in "In Transit" status
const getSampleReceiveInTransit = (req, res) => {
  const staffUserId = req.params.id;
  if (!staffUserId) {
    return res.status(400).json({ error: "Staff User ID is missing" });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 50;
  const offset = (page - 1) * pageSize;
  const { searchField, searchValue } = req.query;
  let searchClause = "";
  if (searchField && searchValue) {
    if (searchField === "quantity") {
      searchClause = ` AND sd.TotalQuantity LIKE ?`;
    } else {
      // For all other fields, dynamically add field without alias
      searchClause = ` AND ${searchField} LIKE ?`;
    }
  }

  // Step 1: Get the collectionsite_id of the user
  const siteQuery = `SELECT collectionsite_id FROM collectionsitestaff WHERE user_account_id = ?`;
  mysqlConnection.query(siteQuery, [staffUserId], (siteErr, siteResults) => {
    if (siteErr || !siteResults.length) {
      return res.status(500).json({ error: "Error fetching collection site" });
    }

    const collectionSiteId = siteResults[0].collectionsite_id;

    // Step 2: Get all user_account_ids in that collection site
    const staffQuery = `SELECT user_account_id FROM collectionsitestaff WHERE collectionsite_id = ?`;
    mysqlConnection.query(staffQuery, [collectionSiteId], (staffErr, staffResults) => {
      if (staffErr || !staffResults.length) {
        return res.status(500).json({ error: "No staff found for this collection site" });
      }
      const userIds = staffResults.map(row => row.user_account_id);
      const placeholders = userIds.map(() => '?').join(',');

      // Step 3: Fetch the samples
      const mainQuery = `
        SELECT DISTINCT
          s.id, s.masterID, s.donorID, s.diseasename, s.age, s.gender,s.volume,
          s.ethnicity, s.samplecondition, s.storagetemp, s.ContainerType,
          s.CountryOfCollection, s.price, s.SamplePriceCurrency,
          s.QuantityUnit, s.SampleTypeMatrix, s.SmokingStatus,
          s.AlcoholOrDrugAbuse, s.InfectiousDiseaseTesting,
          s.InfectiousDiseaseResult, s.FreezeThawCycles,
          s.DateOfSampling, s.ConcurrentMedicalConditions,
          s.ConcurrentMedications, s.TestResult, s.TestResultUnit, s.TestMethod,
          s.TestKitManufacturer, s.TestSystem, s.TestSystemManufacturer, s.logo,
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

      // Query params order: TransferTo (collectionSiteId), userIds..., search value?, limit, offset
      const queryParams = [collectionSiteId, ...userIds];
      if (searchField && searchValue) {
        queryParams.push(`%${searchValue}%`);
      }
      queryParams.push(pageSize, offset);

      mysqlConnection.query(mainQuery, queryParams, (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching samples" });
        }

        // Count query for total results
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
        if (searchField && searchValue) {
          countParams.push(`%${searchValue}%`);
        }
        mysqlConnection.query(countQuery, countParams, (countErr, countResults) => {
          if (countErr) {
            return res.status(500).json({ error: "Error counting results" });
          }

          const totalCount = countResults[0].totalCount;
          const totalPages = Math.ceil(totalCount / pageSize);

          res.status(200).json({
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

// Controller to create a new sample receive
const createSampleReceive = (req, res) => {
  const { id } = req.params; // sampleID
  const { receiverName, ReceivedByCollectionSite } = req.body;
  if (!receiverName || !ReceivedByCollectionSite) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }

  //Step 1: Create the sample receive record
  sampleReceiveModel.createSampleReceive(
    { receiverName, ReceivedByCollectionSite },
    id,
    (err, result) => {
      if (err) {
        console.error("Database error during INSERT:", err);
        return res.status(500).json({ error: "Error creating receive record" });
      }

      // Step 2: Find TransferTo user_account id from ReceivedByCollectionSite
      const findTransferToQuery = `
  SELECT cs.collectionsite_id FROM collectionsitestaff cs WHERE cs.user_account_id = ?
LIMIT 1;
    `;

      mysqlConnection.query(
        findTransferToQuery,
        [ReceivedByCollectionSite],
        (err2, rows) => {
          if (err2) {
            console.error("Error finding TransferTo:", err2);
            return res.status(500).json({ error: "Error finding TransferTo" });
          }

          if (!rows.length) {
            return res
              .status(404)
              .json({ error: "No matching TransferTo found" });
          }

          const transferToUserAccountId = rows[0].collectionsite_id;

          // Step 3: Update sampledispatch with the correct TransferTo
          const updateDispatchStatusQuery = `
        UPDATE sampledispatch
        SET status = 'In Stock'
        WHERE sampleID = ? AND TransferTo = ?
      `;

          mysqlConnection.query(
            updateDispatchStatusQuery,
            [id, transferToUserAccountId],
            (err3) => {
              if (err3) {
                console.error("Error updating sampledispatch status:", err3);
                return res
                  .status(500)
                  .json({ error: "Error updating dispatch status" });
              }

              res.status(201).json({
                message:
                  "Sample Receive created and status updated successfully",
                id: result.insertId,
              });
            }
          );
        }
      );
    }
  );
};

module.exports = {
  createSampleReceiveTable,
  getSampleReceiveInTransit,
  createSampleReceive,
};
