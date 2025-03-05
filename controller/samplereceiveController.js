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

  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }

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
      sr.ReceivedByCollectionSite AS user_account_id,
      sd.Quantity, 
      s.status
      
    FROM samplereceive sr
    INNER JOIN sample s ON sr.sampleID = s.id
    INNER JOIN sampledispatch sd ON s.id = sd.sampleID
    WHERE sr.ReceivedByCollectionSite = ?
  `;

  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching sample receive:", err);
      return res.status(500).json({ error: "Error fetching sample receive" });
    }
    res.status(200).json(results);
  });
};


// Controller to create a new sample receive
const createSampleReceive = (req, res) => {
  const { id } = req.params; // ID of the sample being received
  console.log("Sample receive id is:", id);

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
       WHERE sampleID = ?
     `;

     mysqlConnection.query(updateDispatchStatusQuery, [id], (updateDispatchStatusErr) => {
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