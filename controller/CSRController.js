const csrModel = require("../models/CSRModel");

// Controller to get all organizations
const getAllCSR = (req, res) => {
    csrModel.getAllCSR((err, results) => {
    if (err) {
      console.error("Error fetching CSR:", err);
      return res.status(500).json({ error: "An error occurred while fetching AllCSR" });
    }
    res.status(200).json(results);
  });
};
const  deleteCSR=(req, res)=> {
    const { id } = req.params;
    const { status } = req.body;
    csrModel.deleteCSR(id,status, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error deleting CSR" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "CSR not found" });
      }
      res.status(200).json({ message: "CSR deleted successfully" });
    });
  }
  const  updateCSRStatus=async(req, res)=> {
     const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      try {
        const result = await csrModel.updateCSRStatus(id, status);
        res.status(200).json(result);
      } catch (error) {
        console.error("Error updating CSR status:", error);
        res.status(500).json({ error: "An error occurred while updating CSR status" });
      }
  }
module.exports={
    getAllCSR,
    deleteCSR,
    updateCSRStatus
    
}