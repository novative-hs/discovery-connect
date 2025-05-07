const express = require('express');
const router = express.Router();
const BioBankController = require('../controller/biobankController');
const multer = require("multer");

// Configure storage (memory or disk)
const storage = multer.memoryStorage(); // for buffer
const upload = multer({ storage: storage });

router.get('/biobank/getsamples/:id', BioBankController.getBiobankSamples); 
router.post('/biobank/postBBsample',upload.single("logo"), BioBankController.createBiobankSample); // POST a new sample
router.put('/biobank/editBBsample/:id', upload.single("logo"),BioBankController.updateBiobankSample); // PUT update sample
router.get('/biobank/getQuarantineStock', BioBankController.getQuarantineStock);
router.put('/biobank/UpdateSampleStatus/:id', BioBankController.UpdateSampleStatus); // PUT update sample


module.exports = router;