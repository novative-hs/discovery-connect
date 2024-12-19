const organizationModel = require("../models/organizationModel");

// Controller to create the organization table
const createOrganizationTable = (req, res) => {
  organizationModel.createOrganizationTable();
  res.status(200).json({ message: "Organization table creation process started" });
};

// Controller to get all organizations
const getAllOrganizations = (req, res) => {
  organizationModel.getAllOrganizations((err, results) => {
    if (err) {
      console.error("Error fetching organizations:", err);
      return res.status(500).json({ error: "An error occurred while fetching organizations" });
    }
    res.status(200).json(results);
  });
};

// Controller to update organization status
const updateOrganizationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  organizationModel.updateOrganizationStatus(id, status, (err, result) => {
    if (err) {
      console.error("Error updating organization status:", err);
      return res.status(500).json({ error: "An error occurred while updating status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Organization not found or no changes made" });
    }

    res.status(200).json({ message: "Organization status updated successfully" });
  });
};

module.exports = {
  createOrganizationTable,
  getAllOrganizations,
  updateOrganizationStatus,
};
