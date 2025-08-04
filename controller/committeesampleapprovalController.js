const committeesampleapproval = require("../models/committeesampleapproval");

const createCommitteeSample = async (req, res) => {
  const { cartId, senderId, committeeType } = req.body;

  if (!Array.isArray(cartId)) {
    return res.status(400).json({ error: "cartId must be an array" });
  }

  try {
    for (const singleCartId of cartId) {
      await new Promise((resolve, reject) => {
        committeesampleapproval.insertCommitteeApproval(singleCartId, senderId, committeeType, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    return res.status(201).json({ message: "All cart items processed successfully." });
  } catch (err) {
    console.error("Error processing committee samples:", err);
    return res.status(500).json({ error: err.message || "Failed to process committee samples" });
  }
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

module.exports = {
  createCommitteeSample,
  updateCommitteeStatus
}