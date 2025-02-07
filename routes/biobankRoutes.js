const express = require('express');
const router = express.Router();
const BioBankController = require('../controller/biobankController');


router.get('/biobank/getsamples/:id', BioBankController.getBiobankSamples); // GET a new sample
router.post('/biobank/postBBsample', BioBankController.createBiobankSample); // POST a new sample
router.put('/biobank/editBBsample/:id', BioBankController.updateBiobankSample); // PUT update sample


module.exports = router;