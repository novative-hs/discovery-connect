const mysqlConnection = require("../config/db");
const sampleReceiveModel = require('../models/samplereceiveModel');

// Controller for creating the sample receive table
const createSampleReceiveTable = (req, res) => {
  sampleReceiveModel.createSampleReceiveTable();
  res.status(200).json({ message: "Sample receive table creation process started" });
};

// Controller to get all sample receivees in "In Transit" status
const getSampleReceiveInTransit = (req, res) => {
  const id = req.params.id;
  const { searchField, searchValue } = req.query;
  // Ensure `id` is present
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }

  // Get pagination parameters from query
  const page = parseInt(req.query.page, 10) || 1;  // Default to page 1
  const pageSize = parseInt(req.query.pageSize, 10) || 50;  // Default to 50

  const offset = (page - 1) * pageSize;
  let searchClause = "";
  const queryParams = [id];
  // Modified query to support pagination
   if (searchField && searchValue) {
    searchClause = ` AND s.${searchField} LIKE ?`;
    queryParams.push(`%${searchValue}%`);
  }
  queryParams.push(pageSize, offset);
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
      SELECT sampleID, TransferTo, SUM(Quantity) AS TotalQuantity
      FROM sampledispatch
      WHERE status = 'In Stock'
      GROUP BY sampleID, TransferTo
    ) sd ON sd.sampleID = s.id AND sd.TransferTo = sr.ReceivedByCollectionSite
    WHERE sr.ReceivedByCollectionSite = ? 
      AND s.status = 'In Stock'
      AND sr.sampleID IS NOT NULL
      ${searchClause}
    GROUP BY s.id, sr.ReceivedByCollectionSite, sd.TotalQuantity
    ORDER BY s.id
    LIMIT ? OFFSET ?;
  `;
  // Execute the query
  mysqlConnection.query(query, queryParams, (err, results) => {

    if (err) {
      console.error('Error fetching sample receive:', err);
      return res.status(500).json({ error: "Error fetching sample receive" });
    }

    // Get the total count of records for pagination purposes
    const countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM sample s
    LEFT JOIN samplereceive sr ON sr.sampleID = s.id
    WHERE sr.ReceivedByCollectionSite = ?
      AND s.status = 'In Stock'
      AND sr.sampleID IS NOT NULL
      ${searchClause};
  `;
  const countParams = [id];
if (searchField && searchValue) {
  countParams.push(`%${searchValue}%`);
}



    // Execute the count query to get total number of samples
    mysqlConnection.query(countQuery, countParams, (err, countResults) => {
      if (err) {
        console.error('Error fetching total count:', err);
        return res.status(500).json({ error: "Error fetching total count" });
      }

      const totalCount = countResults[0].totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Return the results with pagination metadata
      res.status(200).json({
        samples: results,
        totalPages,
        currentPage: page,
        pageSize,
        totalCount,
      });
    });
  });
};




// Controller to create a new sample receive
const createSampleReceive = (req, res) => {
  const { id } = req.params; // ID of the sample being received
  

  const { receiverName, ReceivedByCollectionSite } = req.body; // Receiving both receiverName and ReceivedByCollectionSite from the payload

  // Validate input data
  if (!receiverName || !ReceivedByCollectionSite) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Create the sample receive record
  sampleReceiveModel.createSampleReceive({ receiverName, ReceivedByCollectionSite }, id, (err, result) => {
    if (err) {
      console.error('Database error during INSERT:', err);
      return res.status(500).json({ error: 'An error occurred while creating the receive' });
    }

       // Update the sampledispatch table's status to "In Stock"
       const updateDispatchStatusQuery = `
    UPDATE sampledispatch
    SET status = 'In Stock'
    WHERE sampleID = ? AND TransferTo = ?
`;

     mysqlConnection.query(updateDispatchStatusQuery, [id,ReceivedByCollectionSite], (updateDispatchStatusErr) => {
       if (updateDispatchStatusErr) {
         console.error('Database error during UPDATE status in sampledispatch:', updateDispatchStatusErr);
         return res.status(500).json({ error: 'An error occurred while updating the dispatch status' });
       }

      res.status(201).json({ message: 'Sample Receive created successfully', id: result.insertId });
    });
  });
};




module.exports = {
  createSampleReceiveTable,
  getSampleReceiveInTransit,
  createSampleReceive,
};