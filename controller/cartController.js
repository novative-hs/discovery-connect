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
  const {
    researcher_id,
    payment_id,
    cart_items,
    reporting_mechanism,
    sample_id
  } = req.body;

  // Read files from `req.files`
  const study_copy = req.files?.["study_copy"] ? req.files["study_copy"][0].buffer : null;
  const irb_file = req.files?.["irb_file"] ? req.files["irb_file"][0].buffer : null;
  const nbc_file = req.files?.["nbc_file"] ? req.files["nbc_file"][0].buffer : null;

  // Parse cart_items
  let cartItems;
  try {
    cartItems = typeof cart_items === "string" ? JSON.parse(cart_items) : cart_items;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "cart_items must be a non-empty array" });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid cart_items format" });
  }

  // Parse sample_id (optional, only if needed)
  let sampleIds = [];
  try {
    sampleIds = typeof sample_id === "string" ? JSON.parse(sample_id) : sample_id;
  } catch (error) {
    return res.status(400).json({ error: "Invalid sample_id format" });
  }

  // Check required fields
  if (!researcher_id || !payment_id || !reporting_mechanism) {
    return res.status(400).json({
      error: "Missing required fields (Researcher ID, Payment ID, and Reporting Mechanism are required)"
    });
  }

  // Construct data object
  const newCartData = {
    researcher_id,
    payment_id,
    sample_ids: sampleIds, // use parsed sampleIds
    cart_items: cartItems,
    reporting_mechanism,
    study_copy,
    irb_file,
    nbc_file,
  };

  cartModel.createCart(newCartData, (err, result) => {
    if (err) {
      console.error("Error creating cart:", err);
      return res.status(400).json({ error: err.message || "Error creating Cart" });
    }
   return res.status(201).json({
  message: "Cart created successfully",
  tracking_id: result.tracking_id
});

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
const getAllOrder = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchField = req.query.searchField || null;
  const searchValue = req.query.searchValue || null;
  const status = req.query.status || null;

  cartModel.getAllOrder(page, limit, searchField, searchValue, status,(err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching cart list" });
    }
    const { results: data, totalCount} = result;

    res.status(200).json({
      data,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      pageSize: limit,
      totalCount,
    });
    
  });
};

const getAllOrderByCommittee = (req, res) => {
  const { id } = req.params; // committee_member_id
  const { page = 1, pageSize = 10, searchField, searchValue } = req.query;

  cartModel.getAllOrderByCommittee(
    id,
    parseInt(page),
    parseInt(pageSize),
    searchField,
    searchValue,
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching cart list" });
      }
      // Return paginated data and total count
      res.status(200).json({
        results: result.results,
        totalCount: result.totalCount,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      });
    }
  );
};
const getAllDocuments = (req, res) => {
  const { id } = req.params; // committee_member_id
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const { searchField, searchValue } = req.query;

  cartModel.getAllDocuments(page, pageSize, searchField, searchValue,id, (err, data) => {
    if (err) {
      console.error('Controller Error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(data);
  });
};

const getAllOrderByOrderPacking = (req, res) => {
  const csrUserId = req.query.csrUserId;
  const staffAction = req.query.staffAction; // get staffAction from query

  if (!csrUserId) {
    return res.status(400).json({ error: "CSR user ID is required" });
  }

  cartModel.getAllOrderByOrderPacking(csrUserId, staffAction, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching order packing list" });
    }
    res.status(200).json(results);
  });
};



const updateTechnicalAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { technical_admin_status } = req.body;

  if (!technical_admin_status) {
    return res.status(400).json({ error: "technical admin status is required" });
  }

  try {
    const result = await cartModel.updateTechnicalAdminStatus(id, technical_admin_status);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error in update:", err);
    return res.status(500).json({ error: "Error in updating status" });
  }
};
const updateCartStatusbyCSR = (req, res) => {
  const ids = req.body.ids;
  cartModel.updateCartStatusbyCSR(ids, req, (err, result) => {
    if (err) {
      console.error("Error updating cart_status status:", err);
      return res.status(500).json({ error: "Error in updating cart_status" });
    }
    
    res.status(200).json({ message: result }); 
  });
};





const updateCartStatus = (req, res) => {
  const { id } = req.params;
  const { cartStatus } = req.body;
  if (!cartStatus) {
    return res.status(400).json({ error: "cart status is required" });
  }
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
  getAllDocuments,
  getAllOrderByOrderPacking,
  updateTechnicalAdminStatus,
  updateCartStatus,
  updateCartStatusbyCSR
};
