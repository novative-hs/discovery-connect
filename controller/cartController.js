const { Cart, Product } = require("../models/cartModel");

// Add a product to the cart
const addToCart = async (req, res) => {
  const { user_id, product_id, productname, price, quantity } = req.body;
  try {
    const cartItem = await Cart.create({
      user_id,
      product_id,
      productname,
      price,
      quantity,
    });
    res.status(201).json({ status: 'success', data: cartItem });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Get all items in the cart for a specific user
const getCartItems = async (req, res) => {
  const { user_id } = req.params;
  try {
    const cartItems = await Cart.findAll({
      where: { user_id },
      include: [{ model: Product, as: 'product' }],
    });
    res.status(200).json({ status: 'success', data: cartItems });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Update quantity of a product in the cart
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ status: 'fail', message: 'Cart item not found' });
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ status: 'success', data: cartItem });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Delete a product from the cart
const deleteCartItem = async (req, res) => {
  const { id } = req.params;
  try {
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ status: 'fail', message: 'Cart item not found' });
    }
    await cartItem.destroy();
    res.status(200).json({ status: 'success', message: 'Cart item removed' });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

module.exports = { addToCart, getCartItems, updateCartItem, deleteCartItem };
