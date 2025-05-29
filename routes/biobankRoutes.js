const express = require('express');
const router = express.Router();
const BioBankController = require('../controller/biobankController');
const multer = require("multer");

// Configure storage (memory or disk)
const storage = multer.memoryStorage(); // for buffer
const upload = multer({ storage: storage });
router.post('/create-biobank-table', BioBankController.create_biobankTable);
router.get('/biobank/getsamples/:id', BioBankController.getBiobankSamples);
router.post('/biobank/postBBsample', upload.single("logo"), BioBankController.createBiobankSample);
router.post('/biobank/postprice/:id', BioBankController.postSamplePrice);
router.put('/biobank/editBBsample/:id', upload.single("logo"), BioBankController.updateBiobankSample);
router.get('/biobank/getQuarantineStock', BioBankController.getQuarantineStock);
router.put('/biobank/UpdateSampleStatus/:id', BioBankController.UpdateSampleStatus);
router.get("/sample/getprice/:name", BioBankController.getPrice);

module.exports = router;