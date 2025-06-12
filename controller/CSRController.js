const CSRModel = require("../models/CSRModel");

const create_CSRTable = (req, res) => {
  CSRModel.create_CSRTable();
  res.status(200).json({ message: "CSR table creation process started" });
};

// Controller to create csr through registration admin dashboard
const createCSR = (req, res) => {

  CSRModel.createCSR(req.body, (err, result) => {
    if (err) {
      if (err.message === "Email already exists") {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(result);
  });
};

// Controller to get all organizations
const getAllCSR = (req, res) => {
  CSRModel.getAllCSR((err, results) => {
    if (err) {
      console.error("Error fetching CSR:", err);
      return res.status(500).json({ error: "An error occurred while fetching AllCSR" });
    }
    res.status(200).json(results);
  });
};

const deleteCSR = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  CSRModel.deleteCSR(id, status, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting CSR" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "CSR not found" });
    }
    res.status(200).json({ message: "CSR deleted successfully" });
  });
}

const updateCSRStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await CSRModel.updateCSRStatus(id, status);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating CSR status:", error);
    res.status(500).json({ error: "An error occurred while updating CSR status" });
  }
}

module.exports = {
  create_CSRTable,
  createCSR,
  getAllCSR,
  deleteCSR,
  updateCSRStatus

}