const express = require('express');
const router = express.Router();
const BioBankController = require('../controller/biobankController');
const multer = require("multer");

// Configure storage (memory or disk)
const storage = multer.memoryStorage(); // for buffer
const upload = multer({ storage: storage });
router.post('/create-biobank-table', BioBankController.create_biobankTable);
router.get('/biobank/getsamples/:id', BioBankController.getBiobankSamples);
router.post('/biobank/postprice/:id', BioBankController.postSamplePrice);
router.get('/biobank/getQuarantineStock', BioBankController.getQuarantineStock);
router.get('/biobank/getvisibilitysamples/:id', BioBankController.getBiobankVisibilitySamples);
router.put('/biobank/UpdateSampleStatus/:id', BioBankController.UpdateSampleStatus);
router.get("/sample/getprice/:name", BioBankController.getPrice);
router.get('/biobank/getsamplespooled/:id',BioBankController.getBiobankSamplesPooled)
module.exports = router;