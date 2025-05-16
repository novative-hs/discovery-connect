const mysqlConnection = require("../config/db");
const sampleReceiveModel = require('../models/samplereceiveModel');

// Controller for creating the sample receive table
const createSampleReceiveTable = (req, res) => {
  sampleReceiveModel.createSampleReceiveTable();
  res.status(200).json({ message: "Sample receive table creation process started" });
};

// Controller to get all sample receivees in "In Transit" status
const getSampleReceiveInTransit = (req, res) => {
  const id = req.params.id; // CollectionSiteStaff user_account_id
  const { searchField, searchValue } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const pageSize = parseInt(req.query.pageSize, 10) || 50;
  const offset = (page - 1) * pageSize;

  let searchClause = "";
  if (searchField && searchValue) {
    searchClause = ` AND s.${searchField} LIKE ?`;
  }

  // First, find the TransferTo user_account_id for this collection site staff user (id)
  const findTransferToQuery = `
    SELECT ua.id AS user_account_id
    FROM collectionsite c
    JOIN user_account ua ON c.user_account_id = ua.id
    WHERE c.id = (
      SELECT cs.collectionsite_id FROM collectionsitestaff cs WHERE cs.user_account_id = ?
    )
    LIMIT 1;
  `;

  mysqlConnection.query(findTransferToQuery, [id], (err2, rows) => {
    if (err2) {
      console.error("Error finding TransferTo:", err2);
      return res.status(500).json({ error: "Error finding TransferTo" });
    }

    if (!rows.length) {
      return res.status(404).json({ error: "No matching TransferTo found" });
    }

    const transferToUserAccountId = rows[0].user_account_id;

    const query = `
      SELECT 
        s.id,
        s.masterID,
        s.donorID,
        s.samplename,
        s.age,
        s.gender,
        s.ethnicity,
        s.samplecondition,
        s.storagetemp,
        s.ContainerType,
        s.CountryOfCollection,
        s.price,
        s.SamplePriceCurrency,
        s.QuantityUnit,
        s.SampleTypeMatrix,
        s.SmokingStatus,
        s.AlcoholOrDrugAbuse,
        s.InfectiousDiseaseTesting,
        s.InfectiousDiseaseResult,
        s.FreezeThawCycles,
        s.DateOfCollection,
        s.ConcurrentMedicalConditions,
        s.ConcurrentMedications,
        s.DiagnosisTestParameter,
        s.TestResult,
        s.TestResultUnit,
        s.TestMethod,
        s.TestKitManufacturer,
        s.TestSystem,
        s.TestSystemManufacturer,
        sr.ReceivedByCollectionSite,
        s.status,
        COALESCE(sd.TotalQuantity, 0) AS Quantity
      FROM sample s
      LEFT JOIN samplereceive sr ON sr.sampleID = s.id
      LEFT JOIN (
        SELECT sampleID, SUM(Quantity) AS TotalQuantity
        FROM sampledispatch
        WHERE status = 'In Stock' AND TransferTo = ?
        GROUP BY sampleID
      ) sd ON sd.sampleID = s.id
      WHERE sr.ReceivedByCollectionSite = ?
        AND s.status = 'In Stock'
        AND sr.sampleID IS NOT NULL
        ${searchClause}
      GROUP BY s.id
      ORDER BY s.id
      LIMIT ? OFFSET ?;
    `;

    // Build query parameters in correct order for the above query
    const queryParams = [];
    queryParams.push(transferToUserAccountId); // For TransferTo = ?
    queryParams.push(id); // For sr.ReceivedByCollectionSite = ?
    if (searchField && searchValue) {
      queryParams.push(`%${searchValue}%`);
    }
    queryParams.push(pageSize, offset);

    mysqlConnection.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error fetching sample receive:", err);
        return res.status(500).json({ error: "Error fetching sample receive" });
      }

      const countQuery = `
        SELECT COUNT(*) AS totalCount
        FROM sample s
        LEFT JOIN samplereceive sr ON sr.sampleID = s.id
        WHERE sr.ReceivedByCollectionSite = ?
          AND s.status = 'In Stock'
          AND sr.sampleID IS NOT NULL
          ${searchClause};
      `;

      // Parameters for count query
      const countParams = [id];
      if (searchField && searchValue) {
        countParams.push(`%${searchValue}%`);
      }

      mysqlConnection.query(countQuery, countParams, (err, countResults) => {
        if (err) {
          console.error("Error fetching total count:", err);
          return res.status(500).json({ error: "Error fetching total count" });
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
};

// Controller to create a new sample receive
const createSampleReceive = (req, res) => {
  const { id } = req.params; // sampleID
  const { receiverName, ReceivedByCollectionSite } = req.body;

  if (!receiverName || !ReceivedByCollectionSite) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  //Step 1: Create the sample receive record
  sampleReceiveModel.createSampleReceive({ receiverName, ReceivedByCollectionSite }, id, (err, result) => {
    if (err) {
      console.error('Database error during INSERT:', err);
      return res.status(500).json({ error: 'Error creating receive record' });
    }
    console.log(ReceivedByCollectionSite)
    // Step 2: Find TransferTo user_account id from ReceivedByCollectionSite
    const findTransferToQuery = `
      SELECT ua.id AS user_account_id
FROM collectionsite c
JOIN user_account ua ON c.user_account_id = ua.id
WHERE c.id = (
  SELECT cs.collectionsite_id FROM collectionsitestaff cs WHERE cs.user_account_id = ?
)
LIMIT 1;
    `;

    mysqlConnection.query(findTransferToQuery, [ReceivedByCollectionSite], (err2, rows) => {
      if (err2) {
        console.error('Error finding TransferTo:', err2);
        return res.status(500).json({ error: 'Error finding TransferTo' });
      }

      if (!rows.length) {
        return res.status(404).json({ error: 'No matching TransferTo found' });
      }

      const transferToUserAccountId = rows[0].user_account_id;

      // Step 3: Update sampledispatch with the correct TransferTo
      const updateDispatchStatusQuery = `
        UPDATE sampledispatch
        SET status = 'In Stock'
        WHERE sampleID = ? AND TransferTo = ?
      `;

      mysqlConnection.query(updateDispatchStatusQuery, [id, transferToUserAccountId], (err3) => {
        if (err3) {
          console.error('Error updating sampledispatch status:', err3);
          return res.status(500).json({ error: 'Error updating dispatch status' });
        }

        res.status(201).json({ message: 'Sample Receive created and status updated successfully', id: result.insertId });
      });
    });
  });
};





module.exports = {
  createSampleReceiveTable,
  getSampleReceiveInTransit,
  createSampleReceive,
};