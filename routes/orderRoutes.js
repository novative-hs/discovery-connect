const express = require('express');
const router = express.Router();
const orderController = require("../controller/orderController");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });

router.post('/place-order', upload.fields([
  { name: "study_copy", maxCount: 1 },
  { name: "irb_file", maxCount: 1 },
  { name: "nbc_file", maxCount: 1 }
]), orderController.createOrder);

router.get('/getOrderByResearcher/:id', orderController.getOrderByResearcher)
router.get('/getOrderbyCSR', orderController.getOrderByCSR)
router.put('/updatestatusbyCSR', upload.fields([
  { name: "dispatchSlip", maxCount: 1 }
]), orderController.updateCartStatusbyCSR)
router.put('/updateOrderStatus',
  upload.fields([{ name: "dispatchSlip", maxCount: 1 }]),
  orderController.updateOrderStatus)

router.get('/getSampleinDiscover',orderController.getAllSampleinDiscover)
module.exports = router;