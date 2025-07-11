const express = require('express');
const router = express.Router();
const samplefieldsController = require("../controller/samplefieldsController");
const multer = require("multer");

// Configure storage (memory or disk)
const storage = multer.memoryStorage(); // for buffer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // ✅ Maximum file size (10MB or adjust as needed)
    },
});
router.get('/get-samplefields/:tableName', samplefieldsController.getAllSampleFields);
router.post('/post-samplefields/:tableName', (req, res, next) => {
    next();}, upload.fields([
        { name: 'image', maxCount: 1 },
    ]),samplefieldsController.createSampleFields);
    
router.post('/post-analytes/:tableName',(req, res, next) => {
    next();}, upload.fields([
        { name: 'image', maxCount: 1 },
    ]),samplefieldsController.createAnalyte);

router.put('/put-samplefields/:tableName/:id',upload.fields([
        { name: 'image', maxCount: 1 },
    ]), samplefieldsController.updateSampleFields);
router.delete('/delete-samplefields/:tableName/:id', samplefieldsController.deleteSampleFields);
router.get('/:tableName', samplefieldsController.getSampleFieldsNames);
router.get('/get/analyte',samplefieldsController.getAllAnalytes)

module.exports = router;
