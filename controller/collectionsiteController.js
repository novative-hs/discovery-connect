const collectionsiteModel = require('../models/collectionsiteModel');


// Controller for creating the collectionsite table
const createCollectionSiteTable = (req, res) => {
  collectionsiteModel.createCollectionSiteTable();
  res.status(200).json({ message: "Collection site table creation process started" });
};

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

// Controller to delete a collection site
// const deleteCollectionSite = async (req, res) => {
//     const { id } = req.params;
  
//     try {
//       // Retrieve the associated user_account_id
//       const [collectionSite] = await mysqlConnection.query('SELECT user_account_id FROM collectionsite WHERE id = ?', [id]);
  
//       if (!collectionSite.length) {
//         return res.status(404).json({ message: 'Collection site not found' });
//       }
  
//       // Delete the collection site and user account
//       await collectionsiteModel.deleteCollectionSite(id);
//       await collectionsiteModel.deleteUserAccount(collectionSite[0].user_account_id);
  
//       res.status(200).json({ message: 'Collection site and associated user account deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting collection site and user account:', error);
//       res.status(500).json({ message: 'An error occurred while deleting collection site and user account' });
//     }
//   };

module.exports = {
  createCollectionSiteTable,
  getAllCollectionSites,
  getCollectionSiteById,
  updateCollectionSiteStatus,
//   deleteCollectionSite
};
