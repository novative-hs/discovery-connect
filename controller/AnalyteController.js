const AnalyteModel=require('../models/AnalyteModel')

const createAnalyte = (req, res) => {
  const newAnalyteData = req.body;
console.log(newAnalyteData)
  if (!newAnalyteData) {
    return res.status(400).json({ error: "Request body is missing" });
  }

  AnalyteModel.createAnalyte(newAnalyteData, (err, result) => {
    if (err) {
      console.error("Error in createAnalyte controller:", err);
      return res.status(500).json({ error: "Failed to create Analyte" });
    }

    return res.status(201).json({
      message: "Analyte created and history recorded successfully",
      data: result,
    });
  });
};



const getAllAnalytename=(req,res)=>{
    AnalyteModel.getAllAnalytename((err,results)=>{
        if (err) {
      return res.status(500).json({ error: "Error fetching Analyte  list" });
    }
    res.status(200).json(results);
  
    });
}
const updateAnalytename = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  AnalyteModel.updateAnalytename(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating Analyte" });
    }
    res.status(200).json({ message: "Analyte updated successfully", result });
  });
};

const deleteAnalytename=(req,res)=>{
    const {id}=req.params;
    AnalyteModel.deleteAnalytename(id,(err,result)=>{
 if (err) {
      return res.status(500).json({ error: "Error deleting Analyte" });
    }
    res.status(200).json({ message: "Analyte deleted successfully" });
    });
}

module.exports = {
    createAnalyte,
    getAllAnalytename,
    updateAnalytename,
    deleteAnalytename

}