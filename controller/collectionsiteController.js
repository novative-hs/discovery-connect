const collectionsiteModel = require('../models/collectionsiteModel');


// Controller to get all collection sites
const getAllCollectionSites = (req, res) => {
  collectionsiteModel.getAllCollectionSites((err, results) => {
    if (err) {
      console.error('Error fetching collection sites:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json(results);
  });
};

// Controller to get a collection site by ID
const getCollectionSiteById = (req, res) => {
  const { id } = req.params;
  collectionsiteModel.getCollectionSiteById(id, (err, results) => {
    if (err) {
      console.error('Error fetching collection site:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Collection site not found' });
    }
    res.status(200).json(results[0]);
  });
};

// Controller to update collection site status
const updateCollectionSiteStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  collectionsiteModel.updateCollectionSiteStatus(id, status, (err, result) => {
    if (err) {
      console.error('Error updating collection site status:', err);
      return res.status(500).json({ error: 'An error occurred while updating collection site status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Collection site not found or no changes made' });
    }

    res.status(200).json({ message: 'Collection site status updated successfully' });
  });
};
//Controller to delete a collection site
const deleteCollectionSite = (req, res) => {
  const { id } = req.params;  // Get the id from request parameters

  // Pass the id to the model function
  collectionsiteModel.deleteCollectionSite(id, (err, results) => {
    if (err) {
      console.error('Error in deleting collection site:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    res.status(200).json({ message: 'Collection site status updated to unapproved' });
  });
};

// Controller to fetch collection site names
const getAllCollectionSiteNames = (req, res) => {
  const { user_account_id } = req.params; // Extract logged-in user's ID from request parameters
  collectionsiteModel.getAllCollectionSiteNames(user_account_id, (err, results) => {
    if (err) {
      console.error('Error fetching collection site names:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    console.log('Controller Results:', results);
    const siteNames = results
      ?.map(row => ({
        CollectionSiteName: row?.CollectionSiteName,
        user_account_id: row?.user_account_id,
      }))
      .filter(site => site.CollectionSiteName); // Filter valid names
    res.status(200).json({ data: siteNames });
  });
};

const updateCollectionSiteDetail = (req, res) => {
  const { id } = req.params;
  const { useraccount_email, type, CollectionSiteName, phoneNumber, ntnNumber, fullAddress, cityid, districtid, countryid } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Use the file buffer for the logo
  const updateData = {
    useraccount_email,
    CollectionSiteName,
    phoneNumber,
    type,
    ntnNumber,
    fullAddress,
    cityid,
    districtid,
    countryid,
    logo: file.buffer,  // Save the binary data (Buffer) of the file
  };

  collectionsiteModel.updateCollectionSiteDetail(id, updateData, (err, result) => {
    if (err) {
      console.error('Error updating collection site:', err);
      return res.status(500).json({ error: 'An error occurred while updating collection site' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Collection site not found or no changes made' });
    }

    res.status(200).json({ message: 'Collection site updated successfully' });
  });
};
const getCollectionSiteDetail = (req, res) => {
  const { id } = req.params;
  collectionsiteModel.getCollectionSiteDetail(id, (err, results) => {
    if (err) {
      console.error('Error fetching collection site:', err);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Collection site not found' });
    }
    res.status(200).json(results[0]);
  });
};


module.exports = {
  getCollectionSiteDetail,
  updateCollectionSiteDetail,
  getAllCollectionSiteNames,
  getAllCollectionSites,
  getCollectionSiteById,
  updateCollectionSiteStatus,
  deleteCollectionSite
};
