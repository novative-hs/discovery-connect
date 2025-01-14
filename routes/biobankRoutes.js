const express = require('express');
const router = express.Router();
const BioBankController = require('../controller/biobankController');

// Sample Routes
router.get('/biobank/get', BioBankController.getAllBioBank); // GET all samples
router.get('/biobank/:id', BioBankController.getBioBankById); // GET a single sample by ID
router.post('/biobank/post', BioBankController.createBioBank); // POST a new sample
router.put('/biobank/edit/:id', BioBankController.updateBioBank); // PUT update sample
router.delete('/biobank/delete/:id', BioBankController.deleteBioBank); // DELETE a sample


module.exports = router;