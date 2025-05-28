const mysqlConnection = require("../config/db");
const sampleDispatchModel = require("../models/sampledispatchModel");

// Controller for creating the sample dispatch table
const createSampleDispatchTable = (req, res) => {
  sampleDispatchModel.createSampleDispatchTable();
  res
    .status(200)
    .json({ message: "Sample dispatch table creation process started" });
};

// Controller to get all sample dispatches in "In Transit" status
const getDispatchedwithInTransitStatus = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "ID parameter is missing" });
  }

  sampleDispatchModel.getDispatchedwithInTransitStatus(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch dispatched samples" });
    }

    return res.status(200).json({ data: results });
  });
};

const getSampleLost = (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const searchField = req.query.searchField || null;
  const searchValue = req.query.searchValue || null;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  sampleDispatchModel.getSampleLost(
    userId,
    page,
    pageSize,
    searchField,
    searchValue,
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch lost samples" });
      }
      return res.status(200).json(result);
    }
  );
};

// Controller to create a new sample dispatch
const createSampleDispatch = (req, res) => {
  const { id } = req.params; // sampleID
  const {
    TransferFrom,
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity,
    Dispatch_id,
    reason,
    isReturn
  } = req.body;
  const parsedQuantity = parseInt(Quantity, 10);

  const dispatchData = {
    TransferFrom,
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity: parsedQuantity,
    status: "In Transit",
  };

  if (reason && Dispatch_id) {
    const status = "Lost";

    const dispatchQuery = `
   UPDATE sampledispatch
SET Reason = ?, status = ?
WHERE sampleID = ? AND
id = ? AND
TransferTo = ?;
`;

    mysqlConnection.query(
      dispatchQuery,
      [
        reason,
        status,
        req.params.id,
        Dispatch_id,
        TransferTo,
      ],
      (err, result) => {

        if (err) {
          console.error("Error dispatching sample:", err);
          return res.status(500).json({ error: "Error dispatching sample" });
        }
        return res
          .status(200)
          .json({ message: "Sample status update successfully" });
      }
    );
  }
  if (isReturn) {
    sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {

      if (insertErr) {
        console.error("Error dispatching sample:", err);
        return res.status(500).json({ error: "Error dispatching sample" });
      }
      return res
        .status(200)
        .json({ message: "Sample status update successfully" });
    }
    );

  }
  else {
    if (
      !TransferFrom ||
      !TransferTo ||
      !dispatchVia ||
      !dispatcherName ||
      !dispatchReceiptNumber ||
      !Quantity
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res
        .status(400)
        .json({ error: "Quantity must be a valid positive number" });
    }

    // Step 1: Get current quantity of the sample
    const getSampleQuery = `SELECT Quantity AS currentQuantity FROM sample WHERE id = ?`;
    mysqlConnection.query(getSampleQuery, [id], (err, results) => {
      if (err) {
        console.error(" Database error fetching sample:", err);
        return res
          .status(500)
          .json({ error: "Database error fetching sample" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Sample not found" });
      }
      const currentQuantity = parseInt(results[0].currentQuantity, 10);

      // ✅ This is a new dispatch (with quantity deduction)
      if (currentQuantity < parsedQuantity) {
        return res
          .status(400)
          .json({ error: "Insufficient quantity for dispatch" });
      }
      sampleDispatchModel.createSampleDispatch(
        dispatchData,
        id,
        (insertErr, result) => {
          if (insertErr) {
            console.error(
              "❌ Failed to insert dispatch record:",
              insertErr
            );
            return res
              .status(500)
              .json({ error: "Failed to insert dispatch record" });
          }

          const updateSample = `UPDATE sample SET Quantity = Quantity - ? WHERE id = ?`;
          mysqlConnection.query(
            updateSample,
            [parsedQuantity, id],
            (updateErr) => {
              if (updateErr) {
                console.error(
                  "❌ Sample quantity update failed:",
                  updateErr
                );
                return res
                  .status(500)
                  .json({ error: "Sample quantity update failed" });
              }
              console.log(
                "✅ New Dispatch created & Quantity updated in `sample` table."
              );
              return res.status(201).json({
                message: "New dispatch created and quantity updated",
                dispatchId: result.insertId,
              });
            }
          );
        }
      );
    }
    );
  }
};

module.exports = {
  createSampleDispatchTable,
  createSampleDispatch,
  getDispatchedwithInTransitStatus,
  getSampleLost
};
