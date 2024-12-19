const express = require('express');
const router = express.Router();
const collectionsiteController = require('../controller/collectionsiteController');

// Routes for collectionsite
router.get('/get', collectionsiteController.getAllCollectionSites);
router.get('/:id', collectionsiteController.getCollectionSiteById);
router.put('/edit/:id', collectionsiteController.updateCollectionSiteStatus);
// router.delete('/:id', collectionsiteController.deleteCollectionSite);

module.exports = router;
