const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/wishlistController');

// Get all wishlist products
router.get('/wishlist', wishlistController.getWishlistProducts);

// Add/remove product from wishlist
router.post('/wishlist', wishlistController.addToWishlist);

module.exports = router;
