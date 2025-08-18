const committeesampleapproval = require("../models/committeesampleapproval");

const createCommitteeSample = async (req, res) => {
  const { cartId, senderId, committeeType } = req.body;

  if (!Array.isArray(cartId)) {
    return res.status(400).json({ error: "cartId must be an array" });
  }

  try {
    committeesampleapproval.insertCommitteeApproval(cartId, senderId, committeeType, (err, result) => {
      if (err) {
        console.error("Error processing committee samples:", err);
        return res.status(500).json({ error: err.message || "Failed to process committee samples" });
      }
      return res.status(201).json({ message: result.message || "All cart items processed successfully." });
    });

  } catch (err) {
    console.error("Error processing committee samples:", err);
    return res.status(500).json({ error: err.message || "Failed to process committee samples" });
  }
};


const updateCommitteeStatus = (req, res) => {
  const { committee_status, comments, committee_member_id, cart_ids } = req.body;

  if (
    !cart_ids || !Array.isArray(cart_ids) || cart_ids.length === 0 ||
    !committee_status || !comments || !committee_member_id
  ) {
    return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
  }

  // Call once, no loop
  committeesampleapproval.updateCommitteeStatus(
    cart_ids,
    committee_member_id,
    committee_status,
    comments,
    (err, result) => {
      if (err) {
        console.error("❌ Error updating committee status:", err);
        return res.status(500).json({ success: false, message: "One or more updates failed", error: err.message });
      }

      // ✅ Respond properly on success
      return res.status(200).json({ success: true, message: "All updates successful", result });
    }
  );
};

const getHistory = (req, res) => {
  const { trackingIds, status } = req.query;

  const idsArray = trackingIds ? trackingIds.split(',') : [];

  committeesampleapproval.getHistory(idsArray, status, (err, data) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error getting committee approval history",
        error: err.message
      });
    }
    return res.status(200).json({ results:data });
  });
};



module.exports = {
  createCommitteeSample,
  updateCommitteeStatus,
  getHistory
}