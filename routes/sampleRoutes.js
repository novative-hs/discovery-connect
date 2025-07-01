const express = require('express');
const router = express.Router();
const SampleController = require('../controller/sampleController');
const multer = require("multer");

// Configure storage (memory or disk)
const storage = multer.memoryStorage(); // for buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // ✅ Maximum file size (10MB or adjust as needed)
    },
});

// Sample Routes
router.get("/sample/getAllSampleinindex/:name", SampleController.getAllSampleinIndex);
router.get("/sample/getVolumnUnits/:name", SampleController.getAllVolumnUnits)
router.get("/sample/filterdata", SampleController.getFilteredSamples);
router.get('/create-table', SampleController.createSampleTable);
router.get('/sample/get/:id', SampleController.getSamples);
router.get('/sample/getAll', SampleController.getAllSamples);
router.get('/sample/getResearcherSamples/:id', SampleController.getResearcherSamples);
router.get('/sample/getAllSamples', SampleController.getAllCSSamples);
router.get('/sample/:id', SampleController.getSampleById);
router.post(
    '/samples/postsample',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'samplepdf', maxCount: 1 },
    ]),
    SampleController.createSample
);
router.put(
    '/samples/edit/:id',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'samplepdf', maxCount: 1 },
    ]),
    SampleController.updateSample
);
router.delete('/samples/delete/:id', SampleController.deleteSample);
router.put('/samples/QuarantineSamples/:id', SampleController.updateQuarantineSamples);
router.get('/sample/getpoolsamplehistory/:id', SampleController.getPoolSampleDetails)
router.put('/sample/updatetestresultandunit/:id',
      upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'samplepdf', maxCount: 1 },
    ]),SampleController.updatetestResultandUnit)
module.exports = router;