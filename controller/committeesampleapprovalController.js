const committeesampleapproval = require("../models/committeesampleapproval");

const createCommitteeSample = (req, res) => {
  const {cartId,senderId,committeeType} = req.body;

  // Pass data to the model
  committeesampleapproval.insertCommitteeApproval(cartId,senderId,committeeType, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Error creating Cart" });
    }
    res.status(201).json(result); // Send the success response
  });
};

const updateCommitteeStatus = (req, res) => {
  const { committee_status, comments, committee_member_id } = req.body;
  const cartId = req.params.id; // ✅ Extract ID from URL

  if (!cartId || !committee_status || !comments || !committee_member_id) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  committeesampleapproval.updateCommitteeStatus(
    cartId,
    committee_member_id,
    committee_status,
    comments,
    (err, result) => {
      if (err) {
        console.error("Error updating committee status:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
      }

      res.status(200).json(result); // Send success result
    }
  );
};

module.exports={
    createCommitteeSample,
    updateCommitteeStatus
}