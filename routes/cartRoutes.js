const express = require('express');
const router = express.Router();
const cartController = require("../controller/cartController");
const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage });


router.put('/cart/updatedocument/:id', upload.fields([
  { name: "study_copy", maxCount: 1 },
  { name: "irb_file", maxCount: 1 },
  { name: "nbc_file", maxCount: 1 }
]), cartController.updateDocument);

router.get('/cart/:id', cartController.getAllCart); // Get all cart items for a user
router.get('/cart/getCount/:id', cartController.getCartCount); // Get count of cart items for a user

router.delete('/cart/delete/:id', cartController.deleteCart); // Remove a product from the cart
module.exports = router;