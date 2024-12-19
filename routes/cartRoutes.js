const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');

// Add product to cart
router.post('/cart', cartController.addToCart);

// Remove product from cart
router.post('/remove-from-cart', cartController.removeFromCart);

module.exports = router;
