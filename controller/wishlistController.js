const { Wishlist, Product, User } = require('../models/wishlistModel');  // Assuming Sequelize models

// Get all products in wishlist
exports.getWishlistProducts = async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming user ID is available in req.user
    const wishlistItems = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'image_url', 'price', 'discount', 'originalPrice'],
        },
      ],
    });
    res.status(200).json(wishlistItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wishlist' });
  }
};

// Add or remove product from wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated
    const { productId } = req.body;

    const product = await Product.findById(productId, {
      attributes: ['id', 'title', 'image_url'], // Include the required fields
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingProduct = await Wishlist.findOne({ where: { user_id: userId, product_id: productId } });

    if (existingProduct) {
      // Product exists, remove it from the wishlist
      await Wishlist.destroy({ where: { user_id: userId, product_id: productId } });
      return res.status(200).json({ message: 'Product removed from wishlist', product });
    } else {
      // Product does not exist, add it to the wishlist
      await Wishlist.create({ user_id: userId, product_id: productId });
      return res.status(200).json({ message: 'Product added to wishlist', product });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to add/remove product from wishlist' });
  }
};