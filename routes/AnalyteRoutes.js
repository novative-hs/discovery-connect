const express = require('express');
const router = express.Router();
const AnalyteController=require('../controller/AnalyteController')

router.post('/post-Analyte',AnalyteController.createAnalyte)
router.get('/get-Analyte',AnalyteController.getAllAnalytename)

router.put('/update-Analyte/:id', AnalyteController.updateAnalytename);
router.delete('/delete-Analyte/:id',AnalyteController.deleteAnalytename)

module.exports = router;