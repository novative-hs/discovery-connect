const committeememberModel = require("../models/committeememberModel");

// Controller for creating the committe_member table
const createCommitteeMemberTable = (req, res) => {
  committeememberModel.createCommitteeMemberTable();
  res.status(200).json({ message: "Committee member table creation process started" });
};
const getCommitteeOrderHistory = (req, res) => {
  const committeeMemberId = req.params.id;

  committeememberModel.fetchCommitteeOrderHistory(committeeMemberId, (err, results) => {
    if (err) {
      console.error("Error fetching committee order history:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    res.status(200).json(results);
  });
};

// Controller to get all committee members
const getAllCommitteeMembers = (req, res) => {
  committeememberModel.getAllCommitteeMembers((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching committee members" });
    }
    res.status(200).json(results);
  });
};

// Controller to create a committee member
const createCommitteeMember = (req, res) => {
  const newMemberData = req.body;
  committeememberModel.createCommitteeMember(newMemberData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error creating committee member" });
    }
    res.status(201).json({ message: "Committee member created successfully", id: result.insertId });
  });
};

// Controller to update a committee member
const updateCommitteeMember = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  committeememberModel.updateCommitteeMember(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating committee member" });
    }
    res.status(200).json({ message: "Committee member updated successfully" });
  });
};

// Controller to update a committee member's status
const updateCommitteeMemberStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await committeememberModel.updateCommitteeMemberStatus(id, status);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating committee member status:", error);
    res.status(500).json({ error: "An error occurred while updating committee member status" });
  }
};


// Controller to update a committee member's Type
const updateCommitteeMemberType = (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  // Validate that there is at least one field to update
  if (!updateFields || Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  committeememberModel.updateCommitteeMemberType(id, updateFields, (err, result) => {
    if (err) {
      console.error('Error updating committee member type:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Committee Member not found' });
    }
    res.status(200).json({ message: 'Committee Member type updated successfully' });
  });
};

// Controller to delete a committee member
const deleteCommitteeMember = (req, res) => {
  const { id } = req.params;
  committeememberModel.deleteCommitteeMember(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting committee member" });
    }
    res.status(200).json({ message: "Committee member deleted successfully" });
  });
};

module.exports = {
  createCommitteeMemberTable,
  getAllCommitteeMembers,
  createCommitteeMember,
  updateCommitteeMember,
  updateCommitteeMemberStatus,
  updateCommitteeMemberType,
  deleteCommitteeMember,
  getCommitteeOrderHistory
};