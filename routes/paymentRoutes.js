const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

// Sample Routes
router.get('/create-table', paymentController.createPaymentTable);
router.post('/:id', paymentController.insertPaymentDetails); 

module.exports = router;