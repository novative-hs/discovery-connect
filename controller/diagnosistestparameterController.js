const diagnosistestparameterModel=require('../models/diagnosistestparameterModel')

const creatediagnosistestparameter = (req, res) => {
  const newdiagnosisData = req.body;

  diagnosistestparameterModel.creatediagnosistestparameter(newdiagnosisData, (err, result) => {
    if (err) {
      console.error("Error in controller:", err);
      return res.status(500).json({ error: "Error creating diagnosis test parameter" });
    }
    res.status(201).json({
      message: "Diagnosis test parameter handled successfully",
      data: result,
    });
  });
};


const getAlldiagnosisname=(req,res)=>{
    diagnosistestparameterModel.getAlldiagnosisname((err,results)=>{
        if (err) {
      return res.status(500).json({ error: "Error fetching diagnosistestparameter  list" });
    }
    res.status(200).json(results);
  
    });
}
const updateDagnosisname = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  diagnosistestparameterModel.updateDagnosisname(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating diagnosis test parameter" });
    }
    res.status(200).json({ message: "Diagnosis test parameter updated successfully", result });
  });
};

const deleteDagnosisname=(req,res)=>{
    const {id}=req.params;
    diagnosistestparameterModel.deleteDagnosisname(id,(err,result)=>{
 if (err) {
      return res.status(500).json({ error: "Error deleting diagnosis test parameter" });
    }
    res.status(200).json({ message: "diagnosis test parameter deleted successfully" });
    });
}

module.exports = {
    creatediagnosistestparameter,
    getAlldiagnosisname,
    updateDagnosisname,
    deleteDagnosisname

}