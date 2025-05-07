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
router.get('/sample/get/:id', SampleController.getSamples); 
router.get('/sample/getAll', SampleController.getAllSamples);
router.get('/sample/getResearcherSamples/:id', SampleController.getResearcherSamples);
router.get('/sample/getAllSamples', SampleController.getAllCSSamples);
router.get('/sample/:id', SampleController.getSampleById); 
router.post('/samples/postsample', upload.single("logo"),SampleController.createSample); 
router.put('/samples/edit/:id', upload.single("logo"),SampleController.updateSample); 
router.delete('/samples/delete/:id', SampleController.deleteSample); 
router.put('/samples/QuarantineSamples/:id',SampleController.updateQuarantineSamples); 
module.exports = router;