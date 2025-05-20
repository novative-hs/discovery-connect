const express = require('express');
const router = express.Router();
const samplereturnController=require('../controller/samplereturnController')
router.get('/getsamples/:id',samplereturnController.getSamples);

module.exports = router;