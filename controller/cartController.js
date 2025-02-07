const cartModel = require("../models/cartModel");

// Controller for creating the cart table
const createCartTable = (req, res) => {
  cartModel.createCartTable();
  res.status(200).json({ message: "Cart table creation process started" });
};

// Controller to get all cart members
const getAllCart = (req, res) => {
  const { id } = req.params;
 cartModel.getAllCart(id,(err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching cart list" });
    }
    res.status(200).json(results);
  });
};

const getCartCount = (req, res) => {
  const { id } = req.params;
 cartModel.getCartCount(id,(err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching cart list" });
    }
    res.status(200).json(results);
  });
};
// Controller to create a cart member
const createCart = (req, res) => {
    const newCartData = req.body;
  
    // Pass the newCartData directly to the model
    cartModel.createCart(newCartData, (err, result) => {
      if (err) {
        console.log('Error:', err); // Log the error for more insights
        return res.status(500).json({ error: "Error creating Cart" });
      }
      res.status(200).json({
        message: "Cart Item deleted successfully",
        cartCount: result.cartCount,  
      });
    
});
};


const updateCard = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  console.log(updatedData)
  cartModel.updateCart(id, updatedData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error in updating cart" });
    }
    res.status(200).json({ message: "Cart updated successfully" });
  });
};


// Controller to delete a cart member
const deleteCart = (req, res) => {
  const { id } = req.params;
  cartModel.deleteCart(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Cart" });
    }
    res.status(200).json({
      message: "Cart Item deleted successfully",
      cartCount: result.cartCount,  // Ensure cart count is returned
    });
  });
};

const deleteSingleCartItem = (req, res) => {
  const { id } = req.params;
  cartModel.deleteSingleCartItem(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Cart" });
    }
    res.status(200).json({
      message: "Cart Item deleted successfully",
      cartCount: result.cartCount,  // Ensure cart count is returned
    });
  });
};


module.exports = {
  createCartTable,
  getAllCart,
  getCartCount,
  createCart,
  updateCard,
  deleteCart,
  deleteSingleCartItem
};
