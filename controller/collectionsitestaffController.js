const collectionsitestaffModel=require("../models/collectionsitestaffModel")

const create_collectionsitestaffTable = (req, res) => {
collectionsitestaffModel.create_collectionsitestaffTable();
res.status(200).json({message:"Collection site staff created successfully"})
}

const getAllCollectionsitestaff=(req,res)=>{

    collectionsitestaffModel.getAllCollectionsitestaff((err,results)=>{
        if(err){
             console.error('Error fetching collection sites:', err);
      return res.status(500).json({ error: 'An error occurred' });
  
        }
        res.status(200).json(results)
    })
}

const createCollectionsiteStaff=(req,res)=>{
     const { email, password, staffName, collectionsitesid, permission, status } = req.body;

  if (!email || !password || !staffName || !collectionsitesid || !permission || !status) {
    return res.status(400).json({ error: "All fields are required" });
  }
    collectionsitestaffModel.createCollectionsiteStaff(req,(err,results)=>{
        if(err){
             return res.status(500).json({ error: err.message });
        }
        res.status(201).json(results);
    })
}
const updateCollectonsiteStaffStatus=async(req,res)=>{
const {id}=req.params;
const { status } = req.body.data;

try{
const result=await collectionsitestaffModel.updateCollectonsiteStaffStatus(id,status);
res.status(200).json({ message: result.message });
}catch(error){
     console.error('Error in updating status of CollectionSite staff:', error);
    res.status(500).json({ error: 'An error occurred' });
 
}
}
const updateCollectonsiteStaffDetail=async(req,res)=>{
    const {id}=req.params;
    try{
const result=await collectionsitestaffModel.updateCollectonsiteStaffDetail(id,req);
res.status(200).json({ message: result.message });
}catch(error){
     console.error('Error in updating CollectionSite staff:', error);
    res.status(500).json({ error: 'An error occurred' });
 
}
}

module.exports = {
create_collectionsitestaffTable,
getAllCollectionsitestaff,
createCollectionsiteStaff,
updateCollectonsiteStaffStatus,
updateCollectonsiteStaffDetail
}