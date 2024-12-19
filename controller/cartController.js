const { Cart, Product, User } = require('../models/cartModel');

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming user ID is available in req.user
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingCartItem = await Cart.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existingCartItem) {
      // Update the existing item in the cart if already added
      await Cart.update({ quantity: existingCartItem.quantity + quantity }, {
        where: { user_id: userId, product_id: productId },
      });
      return res.status(200).json({ message: 'Product quantity updated', product });
    } else {
      // Create new cart entry if not already in cart
      await Cart.create({ user_id: userId, product_id: productId, quantity });
      return res.status(200).json({ message: 'Product added to cart', product });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product to cart' });
  }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    await Cart.destroy({
      where: { user_id: userId, product_id: productId },
    });

    res.status(200).json({ message: 'Product removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove product from cart' });
  }
};
