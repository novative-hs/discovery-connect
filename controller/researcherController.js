// controllers/researcherController.js
const researcherModel = require("../models/researcherModel");

const create_researcherTable = (req, res) => {
  researcherModel.create_researcherTable();
  res.status(200).json({ message: "Researcher table creation process started" });
};
const fetchOrderHistory = (req, res) => {
  const researcherId = req.params.id;
  researcherModel.fetchOrderHistory(researcherId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch order history" });
    }
    res.status(200).json(results);
  });
};


function getResearchersByOrganization(req, res) {
  const organizationId = req.params.id; // Get the ID from the route parameter

  // Ensure that the 'organizationId' is of type number or string
  if (!organizationId) {
    return res.status(400).json({ error: "Organization ID is required" });
  }

  researcherModel.getResearchersByOrganization(
    organizationId,
    (err, results) => {
      if (err) {

        return res.status(500).json({ error: "Error fetching researchers" });
      }
      res.status(200).json(results);
    }
  );
}

// Controller to handle fetching all researchers
function getAllResearchers(req, res) {
  researcherModel.getAllResearchers((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching researchers" });
    }
    res.status(200).json(results);
  });
}

// Controller to handle fetching a single researcher by ID
function getResearcherById(req, res) {
  const { id } = req.params;
  researcherModel.getResearcherById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching researcher" });
    }
    if (!result.length) {
      return res.status(404).json({ error: "Researcher not found" });
    }
    res.status(200).json(result[0]);
  });
}

// Controller to handle create a researcher
function createResearcher(req, res) {
  const {
    userID,
    ResearcherName,
    phoneNumber,
    nameofOrganization,
    fullAddress,
    city,
    district,
    country,
  } = req.body;

  if (
    !userID ||
    !ResearcherName ||
    !phoneNumber ||
    !nameofOrganization ||
    !fullAddress ||
    !city ||
    !district ||
    !country
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }

  const data = {
    userID,
    ResearcherName,
    phoneNumber,
    nameofOrganization,
    fullAddress,
    city,
    district,
    country,
  };
  researcherModel.createResearcher(data, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error creating researcher ${err}" });
    }
    res
      .status(201)
      .json({
        message: "Researcher created successfully",
        id: result.insertId,
      });
  });
}

// Controller to handle updating a researcher's details
function updateResearcher(req, res) {
  const { id } = req.params;
  
  const {
    userID,
    ResearcherName,
    phoneNumber,
    nameofOrganization,
    fullAddress,
    city,
    district,
    country,
    logo,
  } = req.body;

  // if ( !ResearcherName || !phoneNumber || !nameofOrganization || !fullAddress || !city || !district || !country) {
  //   return res.status(400).json({ error: 'All required fields must be provided' });
  // }

  // const data = { userID,ResearcherName, phoneNumber, nameofOrganization, fullAddress, city,district,country,logo };
  // console.log(data)
  // researcherModel.updateResearcher(id, data, (err, result) => {
  //   if (err) {
  //     return res.status(500).json({ error: 'Error updating researcher' });
  //   }
  //   res.status(200).json({ message: 'Researcher updated successfully' });
  // });
}

// Controller to handle deleting a researcher
const deleteResearcher = async (req, res) => {
  const { id } = req.params;  // Get the id from request parameters

  try {
    // Call the model method and wait for the response
    const result = await researcherModel.deleteResearcher(id);
    
    // Return the success message after the status update
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in deleting researcher:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Registration Admin
// Controller to handle fetching all researchers for the admin dashboard
function getResearchersAdmin(req, res) {
  researcherModel.getAllResearchers((err, results) => {
    if (err) {
      console.error("Error fetching researchers for admin:", err);
      return res.status(500).json({ error: "An error occurred" });
    }
    res.status(200).json(results);
  });
}

// Controller to handle updating researcher status
const updateResearcherStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }
  
  try {
    const result = await researcherModel.updateResearcherStatus(id, status);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating Researcher status:", error);
    res.status(500).json({ error: "An error occurred while updating Researcher status" });
  }
};


module.exports = {
  create_researcherTable,
  getResearchersByOrganization,
  getAllResearchers,
  getResearcherById,
  createResearcher,
  updateResearcher,
  deleteResearcher,
  getResearchersAdmin,
  updateResearcherStatus,
  fetchOrderHistory
};
