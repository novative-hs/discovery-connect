// controllers/researcherController.js
const researcherModel = require('../models/researcherModel');

// Controller to handle creating a researcher
function createResearcher(req, res) {
  const { ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo } = req.body;
  
  if (!ResearcherName || !email || !gender || !phoneNumber || !nameofOrganization || !fullAddress || !country) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const data = { ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo };
  researcherModel.createResearcher(data, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error creating researcher' });
    }
    res.status(201).json({ message: 'Researcher created successfully', id: result.insertId });
  });
}

// Controller to handle fetching all researchers
function getAllResearchers(req, res) {
  researcherModel.getAllResearchers((err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching researchers' });
    }
    res.status(200).json(results);
  });
}

// Controller to handle fetching a single researcher by ID
function getResearcherById(req, res) {
  const { id } = req.params;
  researcherModel.getResearcherById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching researcher' });
    }
    if (!result.length) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    res.status(200).json(result[0]);
  });
}

// Controller to handle updating a researcher's details
function updateResearcher(req, res) {
  const { id } = req.params;
  const { ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo } = req.body;
  
  if (!ResearcherName || !email || !gender || !phoneNumber || !nameofOrganization || !fullAddress || !country) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const data = { ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo };
  researcherModel.updateResearcher(id, data, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating researcher' });
    }
    res.status(200).json({ message: 'Researcher updated successfully' });
  });
}

// Controller to handle deleting a researcher
function deleteResearcher(req, res) {
  const { id } = req.params;
  researcherModel.deleteResearcher(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting researcher' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    res.status(200).json({ message: 'Researcher deleted successfully' });
  });
}

// Registration Admin
// Controller to handle fetching all researchers for the admin dashboard
function getResearchersAdmin(req, res) {
  researcherModel.getAllResearchers((err, results) => {
    if (err) {
      console.error('Error fetching researchers for admin:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
}

// Controller to handle updating researcher status
function updateResearcherStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  researcherModel.updateResearcherStatus(id, status, (err, result) => {
    if (err) {
      console.error('Error updating researcher status:', err);
      return res.status(500).json({ error: 'An error occurred while updating researcher status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Researcher not found or no changes made' });
    }

    res.status(200).json({ message: 'Researcher status updated successfully' });
  });
}


module.exports = {
  createResearcher,
  getAllResearchers,
  getResearcherById,
  updateResearcher,
  deleteResearcher,
  getResearchersAdmin,
  updateResearcherStatus,
};
