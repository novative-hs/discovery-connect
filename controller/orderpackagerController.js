const orderpackagerModel = require("../models/orderpackagerModel");

// Controller to get all organizations
const getAllOrderpackager = (req, res) => {
    orderpackagerModel.getAllOrderpackager((err, results) => {
    if (err) {
      console.error("Error fetching Orderpackager:", err);
      return res.status(500).json({ error: "An error occurred while fetching Orderpackager" });
    }
    res.status(200).json(results);
  });
};
const  deleteOrderpackager=(req, res)=> {
    const { id } = req.params;
    orderpackagerModel.deleteOrderpackager(id, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error deleting Orderpackager" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Orderpackager not found" });
      }
      res.status(200).json({ message: "Orderpackager deleted successfully" });
    });
  }
  const  updateOrderpackagerStatus=async(req, res)=> {
     const { id } = req.params;
      const { status } = req.body;
    
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      try {
        const result = await orderpackagerModel.updateOrderpackagerStatus(id, status);
        res.status(200).json(result);
      } catch (error) {
        console.error("Error updating Orderpackager status:", error);
        res.status(500).json({ error: "An error occurred while updating Orderpackager status" });
      }
  }
module.exports={
    getAllOrderpackager,
    deleteOrderpackager,
    updateOrderpackagerStatus
    
}