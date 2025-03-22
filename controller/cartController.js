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
const createCart = (req, res) => {
  const newCartData = req.body;

  console.log("Incoming request body in controller:", newCartData);

  // Pass data to the model
  cartModel.createCart(newCartData, (err, result) => {
    if (err) {
      console.log("Error:", err); // Log the error for debugging
      return res.status(400).json({ error: err.message || "Error creating Cart" });
    }

    console.log("Insert Result:", result); // Log the result for debugging
    res.status(201).json(result); // Send the success response
  });
};

const updateCard = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
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
    res.status(200).json({ message: "Cart Item deleted successfully" });
  });
};

const deleteSingleCartItem = (req, res) => {
  const { id } = req.params;
  cartModel.deleteSingleCartItem(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting Cart" });
    }
    res.status(200).json({ message: "Cart Item deleted successfully" });
  });
};
const getAllOrder=(req,res)=>{
  cartModel.getAllOrder((err,results)=>{
    if(err){
      return res.status(500).json({error:"Error fetching cart list"})
    }
    res.status(200).json(results);
  })
}
const getAllOrderByCommittee = (req, res) => {
  const { id } = req.params; // ✅ Extract from params

  cartModel.getAllOrderByCommittee(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching cart list" });
    }
    res.status(200).json(results);
  });
};

const updateRegistrationAdminStatus = (req, res) => {
  const { id } = req.params;
  const { registration_admin_status } = req.body;

  if (!registration_admin_status) {
    return res.status(400).json({ error: "Registration admin status is required" });
  }
console.log("Received Body",req.body)
  cartModel.updateRegistrationAdminStatus(id, registration_admin_status, (err, result) => {
    if (err) {
      console.error("Error updating registration admin status:", err);
      return res.status(500).json({ error: "Error in updating status" });
    }
    res.status(200).json({ message: "Registration admin status updated successfully" });
  });
};

const updateCartStatus = (req, res) => {
  const { id } = req.params;
  const { cartStatus } = req.body;
  if (!cartStatus) {
    return res.status(400).json({ error: "Registration admin status is required" });
  }
console.log("Received Body",req.body)
  cartModel.updateCartStatus(id, cartStatus, (err, result) => {
    if (err) {
      console.error("Error updating cart_status status:", err);
      return res.status(500).json({ error: "Error in updating cart_status" });
    }
    res.status(200).json({ message: "Cart status status updated successfully" });
  });
}
module.exports = {
  createCartTable,
  getAllCart,
  getCartCount,
  createCart,
  updateCard,
  deleteCart,
  deleteSingleCartItem,
  getAllOrder,
  getAllOrderByCommittee,
  updateRegistrationAdminStatus,
  updateCartStatus
};
