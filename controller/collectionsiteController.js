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
const updateCollectionSiteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await collectionsiteModel.updateCollectionSiteStatus(id, status);

    res.status(200).json(result); // Sends success response

  } catch (error) {
    console.error("Error updating collection site status:", error);
    res.status(500).json({ error: "An error occurred while updating collection site status" });
  }
};

//Controller to delete a collection site
const deleteCollectionSite = async (req, res) => {
  const { id } = req.params;  // Get the id from request parameters

  try {
    // Call the model method and wait for the response
    const result = await collectionsiteModel.deleteCollectionSite(id);
    
    // Return the success message after the status update
    res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Error in deleting collectionsite:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

// Controller to fetch collection site names in collectionsite dashboard
const getAllCollectionSiteNames = (req, res) => {
  const { user_account_id } = req.params; // Extract logged-in user's ID from request parameters

  collectionsiteModel.getAllCollectionSiteNames(user_account_id, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'An error occurred while fetching data' });
    }

    // Combine data into a single response
    const collectionSites = results.map(row => ({
      CollectionSiteName: row.CollectionSiteName,
      user_account_id: row.user_account_id,
    }));
    res.status(200).json({ data: collectionSites });
    });
};

// Controller to fetch collection site names in biobank dashboard
const getAllCollectionSiteNamesInBiobank = (req, res) => {
  const { sample_id } = req.params;
  
  if (!sample_id) {
    
    return res.status(400).json({ error: "Sample ID is required" });
  }

  collectionsiteModel.getAllCollectionSiteNamesInBiobank(sample_id, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "An error occurred while fetching data" });
    }
      // Ensure the response includes `CollectionSiteName` and `user_account_id`
      const collectionSites = results.map(row => ({
        CollectionSiteName: row.CollectionSiteName,
        user_account_id: row.user_account_id,
      }));

      res.status(200).json({ data: collectionSites });
  });
};

const updateCollectionSiteDetail = (req, res) => {
  const { id } = req.params;
  const { useraccount_email, CollectionSiteName, CollectionSiteType, phoneNumber, fullAddress, cityid, districtid, countryid } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Use the file buffer for the logo
  const updateData = {
    useraccount_email,
    CollectionSiteName,
    CollectionSiteType,
    phoneNumber,
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
  getAllCollectionSiteNamesInBiobank,
  getAllCollectionSites,
  getCollectionSiteById,
  updateCollectionSiteStatus,
  deleteCollectionSite
};
