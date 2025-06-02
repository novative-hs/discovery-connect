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
  const { searchField, searchValue } = req.query;

  sampleReceiveModel.getSampleReceiveInTransit(
    staffUserId,
    page,
    pageSize,
    searchField,
    searchValue,
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(200).json(result);
    }
  );
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
