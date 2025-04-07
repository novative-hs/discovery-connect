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
  const { researcher_id, payment_id, cart_items, reporting_mechanism } = req.body;

  // Read files from `req.files`
  const study_copy = req.files?.["study_copy"] ? req.files["study_copy"][0].buffer : null;
  const irb_file = req.files?.["irb_file"] ? req.files["irb_file"][0].buffer : null;
  const nbc_file = req.files?.["nbc_file"] ? req.files["nbc_file"][0].buffer : null;

  // Convert JSON string fields if necessary
  let cartItems;
  try {
    cartItems = typeof cart_items === "string" ? JSON.parse(cart_items) : cart_items;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "cart_items must be a non-empty array" });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid cart_items format" });
  }

  // Check required fields
  if (!researcher_id || !payment_id || !cartItems || !reporting_mechanism) {
    return res.status(400).json({ error: "Missing required fields (Researcher ID, Payment ID, and Reporting Mechanism are required)" });
  }

  // Construct data object
  const newCartData = {
    researcher_id,
    payment_id, // ✅ Added Payment ID
    cart_items: cartItems,
    reporting_mechanism,
    study_copy,
    irb_file,
    nbc_file,
  };

  // Pass data to the model
  cartModel.createCart(newCartData, (err, result) => {
    if (err) {
      console.error("Error creating cart:", err);  // This is where you'd see the error logs.
      return res.status(400).json({ error: err.message || "Error creating Cart" });
    }
    
    console.log("Insert Result:", result);  // This will log the successful insert result
    return res.status(201).json({ message: "Cart created successfully", result });
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
const getAllOrderByOrderPacking = (req, res) => {
  cartModel.getAllOrderByOrderPacking((err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching order packing list" });
    }
    res.status(200).json(results);
  });
};

const updateRegistrationAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { registration_admin_status } = req.body;

  if (!registration_admin_status) {
    return res.status(400).json({ error: "Registration admin status is required" });
  }

  try {
    const result = await cartModel.updateRegistrationAdminStatus(id, registration_admin_status);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in update:", err);
    return res.status(500).json({ error: "Error in updating status" });
  }
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
  getAllOrderByOrderPacking,
  updateRegistrationAdminStatus,
  updateCartStatus
};
