const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

// Sample Routes
router.get('/create-table', paymentController.createPaymentTable);
router.post('/createPayment', paymentController.insertPaymentDetails); 

module.exports = router;