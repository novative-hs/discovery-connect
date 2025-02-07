const express = require('express');
const router = express.Router();
const cartController = require("../controller/cartController");

router.post('/cart', cartController.createCart); // Add product to cart
router.get('/cart/:id', cartController.getAllCart); // Get all cart items for a user
router.get('/cart/getCount/:id', cartController.getCartCount); // Get count of cart items for a user
router.put('/cart/update/:id', cartController.updateCard); // Update quantity of a product in the cart
router.delete('/cart/delete/:id', cartController.deleteSingleCartItem); // Remove a product from the cart
router.delete('/cart/deleteAll/:id', cartController.deleteCart); // Remove all product from the cart

module.exports = router;
