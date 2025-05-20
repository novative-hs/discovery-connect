const mysqlConnection = require("../config/db");

const createSampleReturnTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS samplereturn (
      id INT AUTO_INCREMENT PRIMARY KEY,
      TransferTo INT NOT NULL,
      TransferFrom INT NOT NULL,
      dispatchVia VARCHAR(255) NOT NULL,
      dispatcherName VARCHAR(255) NOT NULL,
      dispatchReceiptNumber VARCHAR(255) NOT NULL,
      Quantity VARCHAR(255) NOT NULL,
      status VARCHAR(255) DEFAULT 'Returned',
      ReturnDate DATE DEFAULT (CURRENT_DATE),
      sampleID VARCHAR(36) NOT NULL,
      FOREIGN KEY (sampleID) REFERENCES sample(id),
      FOREIGN KEY (TransferTo) REFERENCES user_account(id) ON DELETE CASCADE,
      FOREIGN KEY (TransferFrom) REFERENCES user_account(id) ON DELETE CASCADE
    )
  `;

  mysqlConnection.query(createTableQuery, (err, res) => {
    if (err) {
      console.error("Error creating sample Return table:", err);
    } else {
      console.log("Sample Return table created or already exists.");
    }
  });
};

const getSamples = (id, page, pageSize, searchField, searchValue, callback) => {
  const staffId = parseInt(id, 10);
  if (isNaN(staffId)) {
    return callback({ status: 400, message: "Invalid staff ID" });
  }

  const pageInt = parseInt(page, 10);
  const pageSizeInt = parseInt(pageSize, 10);
  const offset = (pageInt - 1) * pageSizeInt;

  const getUserAccountQuery = `
   SELECT cs.user_account_id
FROM collectionsite cs
JOIN collectionsitestaff cstaff ON cs.id = cstaff.collectionsite_id
WHERE cstaff.user_account_id = ?
LIMIT 1;

  `;

mysqlConnection.query(getUserAccountQuery, [staffId], (err, rows) => {
  if (err) return callback({ status: 500, message: "Error getting collection site user account" });
  if (!rows.length) return callback({ status: 404, message: "Collection site not found for this staff ID" });

  const userAccountId = rows[0].user_account_id; // ✅ Fix: assign user_account_id here

  let searchClause = "";
  const params = [userAccountId, "Returned"];
  if (searchField && searchValue) {
    searchClause = ` AND s.${searchField} LIKE ?`;
    params.push(`%${searchValue}%`);
  }
  params.push(pageSizeInt, offset);

  const query = `
    SELECT sr.*, sr.sampleID, s.samplename, s.donorID, s.age, s.gender,
 s.samplecondition,s.ethnicity,s.ContainerType,s.CountryOfCollection,s.SamplePriceCurrency,s.QuantityUnit,
 s.AlcoholOrDrugAbuse,
  s.ConcurrentMedicalConditions,
    s.ConcurrentMedications,
    s.DiagnosisTestParameter,
    s.TestResult,
    s.TestResultUnit,
    s.TestMethod,
    s.TestKitManufacturer,
    s.TestSystem,
    s.TestSystemManufacturer,
    s.InfectiousDiseaseTesting,
    s.InfectiousDiseaseResult,
    s.FreezeThawCycles,
    s.DateOfCollection,
    s.SampleTypeMatrix,
    s.SmokingStatus
    FROM discoveryconnect.samplereturn sr
    JOIN discoveryconnect.sample s ON sr.sampleID = s.id
   WHERE sr.TransferTo = ?
        AND sr.status = ?
      ${searchClause}
    ORDER BY sr.id DESC
    LIMIT ? OFFSET ?
  `;

  mysqlConnection.query(query, params, (err, results) => {
    if (err) return callback({ status: 500, message: "Error fetching returned samples" });

    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM samplereturn sr
      JOIN sample s ON sr.sampleID = s.id
      WHERE sr.TransferTo = ?
        AND sr.status = ?
        ${searchClause};
    `;

    const countParams = [userAccountId, "Returned"];
    if (searchField && searchValue) {
      countParams.push(`%${searchValue}%`);
    }

    mysqlConnection.query(countQuery, countParams, (err, countResults) => {
      if (err) return callback({ status: 500, message: "Error fetching sample count" });

      const totalCount = countResults[0].totalCount;

      return callback(null, {
        results,
        totalCount,
        currentPage: pageInt,
        pageSize: pageSizeInt
      });
    });
  });
});

};



module.exports = {
  createSampleReturnTable,
  getSamples
};
