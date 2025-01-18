const express = require('express');
const router = express.Router();
const sampleDispatchController = require('../controller/biobanksampledispatchController');



// Route to get all sample dispatches that are "In Transit"
router.get('/get', sampleDispatchController.getSampleDispatchesInTransit);
router.get('/getDispatchDetail', sampleDispatchController.getSampleDispatchesDetail);

// Route to create a new sample dispatch
router.post('/post/:id', sampleDispatchController.createSampleDispatch);

module.exports = router;
