const express = require('express');
const router = express.Router();
const sampleDispatchController = require('../controller/sampledispatchController');


// Route to create the sample dispatch table
router.post('/create', sampleDispatchController.createSampleDispatchTable);

// Route to get all sample dispatches that are "In Transit"
// router.get('/get/:id', sampleDispatchController.getSampleDispatchesInTransit);

// Route to get all sample dispatches that are "In Transit"
router.get('/get/:id', sampleDispatchController.getDispatchedwithInTransitStatus);
router.get('/getlostsample/:id',sampleDispatchController.getSampleLost)
// Route to create a new sample dispatch
router.post('/post/:id', sampleDispatchController.createSampleDispatch);

module.exports = router;