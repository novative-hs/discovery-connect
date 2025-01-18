const mysqlConnection = require("../config/db");

const getSampleDispatchesInTransit = (callback) => {  
    const query = `SELECT s.* FROM sample s WHERE s.status = "In Transit"`;
    console.log('Executing query:', query); // Log the query
    mysqlConnection.query(query, callback);
  };

  const getSampleDispatchesDetail = (callback) => {
      const query = `SELECT 
    sd.id AS DispatchID,
    sd.dispatchVia AS DispatchMethod,
    sd.dispatcherName AS DispatcherName,
    sd.dispatchReceiptNumber AS DispatchReceiptNumber,
    sd.sendtocollectionsiteID AS SendToCollectionSiteID,
    sd.sendfromcollectionsiteID AS SendFromCollectionSiteID,
    sd.dateTime as DateTime, 
    s.*,
    b.Name AS BiobankName,
    csTo.CollectionSiteName AS SendToCollectionSiteName,
    csFrom.CollectionSiteName AS SendFromCollectionSiteName
FROM 
    sampledispatch sd
LEFT JOIN 
    sample s ON sd.sampleID = s.id
LEFT JOIN 
    biobank b ON sd.biobankID = b.id
LEFT JOIN 
    collectionsite csTo ON sd.sendtocollectionsiteID = csTo.user_account_id
LEFT JOIN 
    collectionsite csFrom ON sd.sendfromcollectionsiteID = csFrom.user_account_id
WHERE 
    s.status = 'In Transit';
`;
      mysqlConnection.query(query, callback);
    };


const createSampleDispatch = (dispatchData, sampleID, callback) => {
  const {dispatchVia, dispatcherName, dispatchReceiptNumber, biobankid } = dispatchData;
  const query = `
    INSERT INTO sampledispatch (dispatchVia, dispatcherName, dispatchReceiptNumber, sampleID,biobankID)
    VALUES (?, ?, ?, ?,?)
  `;
  
  mysqlConnection.query(query, [dispatchVia, dispatcherName, dispatchReceiptNumber, sampleID,biobankid], callback);
};

module.exports = {
  getSampleDispatchesInTransit,
  getSampleDispatchesDetail,
  createSampleDispatch,
};
