const committeesampleapproval = require("../models/committeesampleapproval");

const createCommitteeSample = (req, res) => {
  const {cartId,senderId,committeeType} = req.body;

  // Pass data to the model
  committeesampleapproval.insertCommitteeApproval(cartId,senderId,committeeType, (err, result) => {
    if (err) {
      console.log("Error:", err); // Log the error for debugging
      return res.status(400).json({ error: err.message || "Error creating Cart" });
    }

    console.log("Insert Result:", result); // Log the result for debugging
    res.status(201).json(result); // Send the success response
  });
};
const updateCommitteeStatus = (req, res) => {
  const { committee_status, comments } = req.body;
  const cartId = req.params.id; // ✅ Extract ID from params

  if (!cartId || !committee_status || !comments) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  committeesampleapproval.updateCommitteeStatus(cartId, committee_status, comments, (err, result) => {
    if (err) {
      console.error("Error updating committee status:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json(result);
  });
};

module.exports={
    createCommitteeSample,
    updateCommitteeStatus
}