const committeesampleapproval = require("../models/committeesampleapproval");

const createCommitteeSample = async (req, res) => {
  const { cartId, senderId, committeeType } = req.body;
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
  const { committee_status, comments, committee_member_id, order_id} = req.body;

  if (
    !order_id || !committee_status || !comments || !committee_member_id
  ) {
    return res.status(400).json({ success: false, error: "Missing or invalid required fields" });
  }

  // Call once, no loop
  committeesampleapproval.updateCommitteeStatus(
    order_id,
    committee_member_id,
    committee_status,
    comments,
    (err, result) => {
      if (err) {
        console.error("❌ Error updating committee status:", err);
        return res.status(500).json({ success: false, message: "One or more updates failed", error: err.message });
      }

      // ✅ Respond properly on success
      return res.status(200).json({ success: true, message: "Comments updates successful", result });
    }
  );
};


const getAllOrderByCommittee = (req, res) => {
  const { id } = req.params; // committee_member_id
  const { page = 1, pageSize = 10, searchField, searchValue } = req.query;

  committeesampleapproval.getAllOrderByCommittee(
    id,
    parseInt(page),
    parseInt(pageSize),
    searchField,
    searchValue,
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching cart list" });
      }
      // Return paginated data and total count
      res.status(200).json({
        results: result.results,
        totalCount: result.totalCount,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      });
    }
  );
};

const getAllDocuments = (req, res) => {
  const { id } = req.params; // committee_member_id
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const { searchField, searchValue } = req.query;

  committeesampleapproval.getAllDocuments(page, pageSize, searchField, searchValue, id, (err, data) => {
    if (err) {
      console.error('Controller Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(data);
  });
};

module.exports = {
  createCommitteeSample,
  updateCommitteeStatus,
  getAllOrderByCommittee,
  getAllDocuments
}