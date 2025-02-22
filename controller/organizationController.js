const organizationModel = require("../models/organizationModel");

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
const getCurrentOrganizationById = (req, res) => {
  const { id } = req.params;
  organizationModel.getCurrentOrganizationById(id,(err, results) => {
    if (err) {
      console.error("Error fetching organizations:", err);
      return res.status(500).json({ error: "An error occurred while fetching organizations" });
    }
    res.status(200).json(results);
  });
};


// Controller to update organization status
const updateOrganizationStatus = async(req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
try {
    const result = await organizationModel.updateOrganizationStatus(id, status);
    res.status(200).json(result); // Sends success response
  } catch (error) {
    console.error("Error updating Organization  status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating Organization status" });
  }
};

const updateOrganization = (req, res) => {
  console.log("Request",req.body)
  const {user_account_id,OrganizationName, type,HECPMDCRegistrationNo,phoneNumber, fullAddress, city,district,country,ntnNumber,useraccount_email } = req.body;
  

  if (!user_account_id || !OrganizationName ||!type||!ntnNumber|| !phoneNumber || !fullAddress || !city || !district || !country ||!useraccount_email) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
 const data =  {OrganizationName, type,HECPMDCRegistrationNo,phoneNumber, fullAddress, city,district,country,ntnNumber,useraccount_email } ;
   organizationModel.updateOrganization(data,user_account_id, (err, result) => {
     if (err) {
       return res.status(500).json({ error: 'Error updating researcher' });
     }
     res.status(200).json({ message: 'Researcher updated successfully' });
   });
  
};



const getOrganizationById = (req, res) => {
  const { id } = req.params;
  organizationModel.getOrganizationById(id, (err, results) => {
    if (err) {
      console.error('Error fetching Organization:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.status(200).json(results[0]);
  });
};

const deleteOrganization = (req, res) => {
  const { id } = req.params;  // Get the id from request parameters

  // Pass the id to the model function
  organizationModel.deleteOrganization(id, (err, results) => {
    if (err) {
      console.error('Error in deleting organization:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json({ message: 'Organization status updated to unapproved' });
  });
};
module.exports = {
  getOrganizationById,
  updateOrganization,
  getCurrentOrganizationById,
  deleteOrganization,
  getAllOrganizations,
  updateOrganizationStatus,
};
