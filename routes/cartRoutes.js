const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCartItems,
  updateCartItem,
  deleteCartItem,
} = require('../controller/cartController');

router.post('/cart', addToCart); // Add product to cart
router.get('/cart/:user_id', getCartItems); // Get all cart items for a user
router.put('/cart/:id', updateCartItem); // Update quantity of a product in the cart
router.delete('/cart/:id', deleteCartItem); // Remove a product from the cart

module.exports = router;
