const express = require('express');
const router = express.Router();
const SampleController = require('../controller/sampleController');

// Sample Routes
router.get('/create-table', SampleController.createSampleTable);
router.get('/sample/get/:id', SampleController.getSamples); // GET all samples for that specific Collectionsite Id
router.get('/sample/getAll', SampleController.getAllSamples);
router.get('/sample/:id', SampleController.getSampleById); // GET a single sample by ID
router.post('/samples/post', SampleController.createSample); // POST a new sample
router.put('/samples/edit/:id', SampleController.updateSample); // PUT update sample
router.delete('/samples/delete/:id', SampleController.deleteSample); // DELETE a sample


module.exports = router;