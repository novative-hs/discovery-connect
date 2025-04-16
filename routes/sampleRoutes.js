const express = require('express');
const router = express.Router();
const SampleController = require('../controller/sampleController');
const multer = require("multer");

// Configure storage (memory or disk)
const storage = multer.memoryStorage(); // for buffer
const upload = multer({ storage: storage });
// Sample Routes
router.get("/sample/filterdata", SampleController.getFilteredSamples);
router.get('/create-table', SampleController.createSampleTable);
router.get('/sample/get/:id', SampleController.getSamples); // GET all samples for that specific Collectionsite Id
router.get('/sample/getAll', SampleController.getAllSamples);
router.get('/sample/getResearcherSamples/:id', SampleController.getResearcherSamples);
router.get('/sample/getAllSamples', SampleController.getAllCSSamples);
router.get('/sample/:id', SampleController.getSampleById); // GET a single sample by ID
router.post('/samples/postsample', upload.single("logo"),SampleController.createSample); // POST a new sample
router.put('/samples/edit/:id', upload.single("logo"),SampleController.updateSample); // PUT update sample
router.delete('/samples/delete/:id', SampleController.deleteSample); // DELETE a sample

module.exports = router;