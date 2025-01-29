const express = require('express');
const router = express.Router();
const BioBankController = require('../controller/biobankController');


router.get('/biobank/getsamples/:id', BioBankController.getBiobankSamples); // GET a new sample


module.exports = router;