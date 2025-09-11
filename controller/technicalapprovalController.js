const mysqlConnection = require("../config/db");
const technicaladminsampleapproval=require('../models/technicalapprovalModel')

const getOrderbyTechnical = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchField = req.query.searchField || null;
  const searchValue = req.query.searchValue || null;
  const status = req.query.status || null;

  technicaladminsampleapproval.getOrderbyTechnical(page, limit, searchField, searchValue, status,(err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching cart list" });
    }
    const { results: data, totalCount} = result;

    res.status(200).json({
      data,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      pageSize: limit,
      totalCount,
    });
    
  });
};

const getDocuments = (req, res) => {
  const { id } = req.params;
  technicaladminsampleapproval.getDocuments(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error fetching sample document",
      });
    }

    res.status(200).json({
      success: true,
      documents: results, // Send in the expected key
    });
  });
};

const getHistory = (req, res) => {
  const { tracking_id, status } = req.query;
  technicaladminsampleapproval.getHistory(tracking_id, status, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error getting committee approval history",
        error: err.message
      });
    }
    return res.status(200).json(results);
  });
};

const updateTechnicalAdminStatus = async (req, res) => {
  const { order_id, technical_admin_status, comment } = req.body;

  try {
    await technicaladminsampleapproval.updateTechnicalAdminStatus(order_id, technical_admin_status, comment || null);

    return res.status(200).json({ message: "All statuses updated successfully" });
  } catch (err) {
    console.error("Error in bulk update:", err);
    return res.status(500).json({ error: "Bulk update failed" });
  }
};

module.exports = {
getOrderbyTechnical,
getDocuments,
getHistory,
updateTechnicalAdminStatus
}