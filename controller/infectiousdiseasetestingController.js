const infectiousdiseaseModel=require('../models/infectiousdiseasetestingModel')

const create_infectiousdiseaseTable=(req,res)=>{
infectiousdiseaseModel.create_infectiousdiseaseTable();
res.status(200).json({message:"infectious disease testing table created"})
}

const getAllinfectiousdisease=(req,res)=>{
    infectiousdiseaseModel.getAllinfectiousdisease((err,results)=>{
        if(err){
return res.status(500).json({ error: "Error fetching city list" });
    }
    res.status(200).json(results);
    })
}

const createinfectiousdisease=(req,res)=>{
const newinfectiousdiseaseData=req.body;
infectiousdiseaseModel.createinfectiousdisease(newinfectiousdiseaseData,(err,result)=>{
    if (err) {
        return res.status(500).json({ error: "Error creating infectious disease testing" });
      }
      res.status(201).json({ message: "infectious disease testing added successfully", id: result.insertId });
    
});
}
const updateinfectiousdisease=(req,res)=>{
    const { id } = req.params;
  const updatedData = req.body;
  infectiousdiseaseModel.updateinfectiousdisease(id,updatedData,(err,results)=>{
     if (err) {
      return res.status(500).json({ error: "Error in updating infectiousdisease" });
    }
    res.status(200).json({ message: "infectiousdisease updated successfully" });
  })
}

const deleteinfectiousdisease = (req, res) => {
  const { id } = req.params;
  infectiousdiseaseModel.deleteinfectiousdisease(id, (err, result) => { // ✅ fixed
    if (err) {
      return res.status(500).json({ error: "Error deleting infectious disease" });
    }
    res.status(200).json({ message: "infectious disease deleted successfully" });
  });
};

module.exports = {
create_infectiousdiseaseTable,
getAllinfectiousdisease,
createinfectiousdisease,
updateinfectiousdisease,
deleteinfectiousdisease
}