const express = require('express');
const router = express.Router();
const cartController = require("../controller/cartController");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });

router.get('/cart/getOrder', cartController.getAllOrder)
router.get('/cart/getOrderbyCommittee/:id', cartController.getAllOrderByCommittee)
router.get('/cart/getAllDocuments/:id', cartController.getAllDocuments)
router.get('/cart/getOrderbyCSR', cartController.getAllOrderByCSR);


router.post('/cart', upload.fields([
  { name: "study_copy", maxCount: 1 },
  { name: "irb_file", maxCount: 1 },
  { name: "nbc_file", maxCount: 1 }
]), cartController.createCart);

router.put('/cart/updatedocument/:id', upload.fields([
  { name: "study_copy", maxCount: 1 },
  { name: "irb_file", maxCount: 1 },
  { name: "nbc_file", maxCount: 1 }
]), cartController.updateDocument);

router.get('/cart/getsampledocuments/:id', cartController.getSampleDocument)

router.get('/cart/:id', cartController.getAllCart); // Get all cart items for a user
router.get('/cart/getCount/:id', cartController.getCartCount); // Get count of cart items for a user
router.put('/cart/update/:id', cartController.updateCard); // Update quantity of a product in the cart
router.put("/cart/bulk-update-Technicalstatus", (req, res, next) => {
  next();
}, cartController.updateTechnicalAdminStatus);

router.put(
  "/cart/updatecart-status",
  upload.fields([{ name: "dispatchSlip", maxCount: 1 }]),
  cartController.updateCartStatus
);


router.put('/cart/cartstatusbyCSR',
  upload.fields([
    { name: "dispatchSlip", maxCount: 1 }
  ]),
  cartController.updateCartStatusbyCSR);

router.delete('/cart/delete/:id', cartController.deleteCart); // Remove a product from the cart
module.exports = router;