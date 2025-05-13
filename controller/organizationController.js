const organizationModel = require("../models/organizationModel");


const create_organizationTable = (req, res) => {
  organizationModel.create_organizationTable();
  res.status(200).json({ message: "Organization table creation process started" });
};

// Controller to create organizations
const createOrganization = (req, res) => {
  organizationModel.createOrganization(req, (err, result) => {
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
  organizationModel.getCurrentOrganizationById(id, (err, results) => {
    if (err) {
      console.error("Error fetching organizations:", err);
      return res.status(500).json({ error: "An error occurred while fetching organizations" });
    }
    res.status(200).json(results);
  });
};

const updateOrganization = (req, res) => {

  const { user_account_id, OrganizationName, type, HECPMDCRegistrationNo, phoneNumber, fullAddress, city, district, country, ntnNumber, useraccount_email } = req.body;


  if (!user_account_id || !OrganizationName || !type || !ntnNumber || !phoneNumber || !fullAddress || !city || !district || !country || !useraccount_email) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }
  const data = { OrganizationName, type, HECPMDCRegistrationNo, phoneNumber, fullAddress, city, district, country, ntnNumber, useraccount_email };
  organizationModel.updateOrganization(data, user_account_id, (err, result) => {
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

// Controller to update organization Status (Active/Inactive))
const updateOrganizationStatus = async (req, res) => {
  const { id } = req.params;  // Get the id from request parameters
  const { status } = req.body;
  try {
    // Call the model method and wait for the response
    const result = await organizationModel.updateOrganizationStatus(id, status);

    // Return the success message after the status update
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in deleting organization:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = {
  create_organizationTable,
  createOrganization,
  getOrganizationById,
  updateOrganization,
  getCurrentOrganizationById,
  getAllOrganizations,
  updateOrganizationStatus,
};
