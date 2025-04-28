const express = require('express');
const router = express.Router();
const samplefieldsController = require("../controller/samplefieldsController");

router.get('/get-samplefields/:tableName', samplefieldsController.getAllSampleFields);
router.post('/post-samplefields/:tableName', (req, res, next) => {
    next();}, samplefieldsController.createSampleFields);
router.put('/put-samplefields/:tableName/:id', samplefieldsController.updateSampleFields);
router.delete('/delete-samplefields/:tableName/:id', samplefieldsController.deleteSampleFields);
router.get('/:tableName', samplefieldsController.getSampleFieldsNames);

module.exports = router;
