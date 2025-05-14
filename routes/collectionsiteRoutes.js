const express = require('express');
const router = express.Router();
const multer = require('multer');
const collectionsiteController = require('../controller/collectionsiteController');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route Definitions

router.post('/create-collectionsite-table', collectionsiteController.create_collectionsiteTable);
router.get('/collectionsitenames', collectionsiteController.getAllCollectionSiteNames);
router.get('/get', collectionsiteController.getAllCollectionSites);
router.get('/:id', collectionsiteController.getCollectionSiteById);

router.get('/getAllNameinCSR',collectionsiteController.getAllCollectionSiteNamesInCSR)
// Register Collection site from Database Admin dashboard
router.post(
  '/createcollsite',
  upload.fields([
    { name: 'logo', maxCount: 1 },
  ]),
  collectionsiteController.createCollectionSite
);

// router.post('/post', collectionsiteController.createCollectionSite); 
// router.put('/edit/:id', collectionsiteController.updateCollectionSiteStatus);
router.delete('/edit/:id', collectionsiteController.updateCollectionSiteStatus);  // Route to update Collection Site status (active/inactive)
router.delete('/delete/:id', collectionsiteController.deleteCollectionSite);
router.get('/collectionsitenames/:user_account_id', collectionsiteController.getAllCollectionSiteNames);
router.get("/collectionsitenamesinbiobank/:sample_id", collectionsiteController.getAllCollectionSiteNamesInBiobank);
router.put('/updatedetail/:id', upload.single('logo'), collectionsiteController.updateCollectionSiteDetail);
router.get('/get/:id',collectionsiteController.getCollectionSiteDetail)
module.exports = router;
