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

const createSampleDispatch = (req, res) => {
  const { id } = req.params; // sampleID from URL param
  const {
    sampleID,
    TransferFrom,
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity,
    Dispatch_id,
    reason,
    isReturn,
  } = req.body;

  const parsedQuantity = parseInt(Quantity, 10);

  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: "Quantity must be a valid positive number" });
  }

  const dispatchData = {
    sampleID,
    TransferFrom,
    TransferTo,
    dispatchVia,
    dispatcherName,
    dispatchReceiptNumber,
    Quantity: parsedQuantity,
    status: "In Transit",
  };

  // 1. Handle Lost Sample
  if (reason && Dispatch_id) {
    return sampleDispatchModel.markSampleLost(reason, id, Dispatch_id, TransferTo, (err) => {
      if (err) return res.status(500).json({ error: "Error marking sample as lost" });
      return res.status(200).json({ message: "Sample marked as lost" });
    });
  }
  if (isReturn) {
    return sampleDispatchModel.getDispatchBySampleId(sampleID, (err, results) => {
      if (err) return res.status(500).json({ error: "Error checking existing dispatch" });

      if (results.length > 0) {
        const existingDispatchId = results[0].id;

        return sampleDispatchModel.updateExistingDispatch(dispatchData, existingDispatchId, (updateErr) => {
          console.error("Error updating dispatch:", updateErr);
          if (updateErr) return res.status(500).json({ error: "Failed to update dispatch" });

          return res.status(200).json({ message: "Dispatch updated successfully" });
        });
      } else {
        return res.status(404).json({ error: "No dispatch found with matching sampleID" });
      }
    });
  }


  // 3. Validate required fields
  if (!TransferFrom || !TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  // 4. Check available sample quantity
  sampleDispatchModel.getSampleById(id, (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching sample" });
    if (results.length === 0) return res.status(404).json({ error: "Sample not found" });

    const currentQty = parseInt(results[0].Quantity, 10);
    if (currentQty < parsedQuantity) {
      return res.status(400).json({ error: "Insufficient quantity for dispatch" });
    }

    sampleDispatchModel.getExistingDispatch(sampleID, TransferFrom, TransferTo, (checkErr, existingRows) => {
      if (checkErr) return res.status(500).json({ error: "Error checking existing dispatch" });

      if (existingRows.length > 0) {
        // fetch full dispatch row to check status
        const existingDispatchId = existingRows[0].id;

        // Get full dispatch details (including status)
        sampleDispatchModel.getDispatchById(existingDispatchId, (err2, dispatchRows) => {
          if (err2) return res.status(500).json({ error: "Error fetching existing dispatch" });

          if (dispatchRows.length > 0 && dispatchRows[0].status === 'In Stock') {
            // update existing
            return sampleDispatchModel.updateExistingDispatch(dispatchData, existingDispatchId, (updateErr) => {
              if (updateErr) return res.status(500).json({ error: "Error updating dispatch" });

              // update sample qty
              // return sampleDispatchModel.updateSampleQuantity(id, parsedQuantity, (qtyErr) => {
              //   if (qtyErr) return res.status(500).json({ error: "Error updating sample quantity" });

              // Update sample status
              return sampleDispatchModel.updateSampleStatusToInTransit(id, (statusErr) => {
                if (statusErr) return res.status(500).json({ error: "Error updating sample status" });

                return res.status(200).json({ message: "Existing dispatch updated successfully" });
              });
              // });
            });
          } else {
            // existing dispatch is not 'In Stock' => create new
            return sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {
              if (insertErr) return res.status(500).json({ error: "Error creating new dispatch" });

              // return sampleDispatchModel.updateSampleQuantity(id, parsedQuantity, (qtyErr) => {
              //   if (qtyErr) return res.status(500).json({ error: "Error updating sample quantity" });

              // Update sample status
              return sampleDispatchModel.updateSampleStatusToInTransit(id, (statusErr) => {
                if (statusErr) return res.status(500).json({ error: "Error updating sample status" });

                return res.status(201).json({
                  message: "New dispatch created successfully",
                  dispatchId: result.insertId,
                });
              });
            });
            // });
          }
        });
      } else {
        // no existing dispatch, create new
        return sampleDispatchModel.createSampleDispatch(dispatchData, id, (insertErr, result) => {
          if (insertErr) return res.status(500).json({ error: "Error creating new dispatch" });

          // return sampleDispatchModel.updateSampleQuantity(id, parsedQuantity, (qtyErr) => {
          //   if (qtyErr) return res.status(500).json({ error: "Error updating sample quantity" });

          // Update sample status
          return sampleDispatchModel.updateSampleStatusToInTransit(id, (statusErr) => {
            if (statusErr) return res.status(500).json({ error: "Error updating sample status" });

            return res.status(201).json({
              message: "New dispatch created successfully",
              dispatchId: result.insertId,
            });
          });
          // });
        });
      }
    });
  });
};




module.exports = {
  createSampleDispatchTable,
  createSampleDispatch,
  getDispatchedwithInTransitStatus,
  getSampleLost
};
