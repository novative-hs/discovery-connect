const express = require('express');
const router = express.Router();
const sampleReceiveController = require('../controller/samplereceiveController');


// Route to create the sample receive table
router.post('/create', sampleReceiveController.createSampleReceiveTable);

// Route to get all sample receive that are "In Transit"
router.get('/get/:id', sampleReceiveController.getSampleReceiveInTransit);

// Route to create a new sample receive
router.post('/post/:id', sampleReceiveController.createSampleReceive);

module.exports = router;