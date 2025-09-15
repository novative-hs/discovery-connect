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


const updateDocument = (req, res) => {
  const { id } = req.params; // tracking_id from URL
  const {added_by}=req.body;
  const study_copy = req.files?.["study_copy"] ? req.files["study_copy"][0].buffer : null;
  const irb_file = req.files?.["irb_file"] ? req.files["irb_file"][0].buffer : null;
  const nbc_file = req.files?.["nbc_file"] ? req.files["nbc_file"][0].buffer : null;

  const newCartData = {
    tracking_id: id,
    added_by,
    study_copy,
    irb_file,
    nbc_file,
  };

  cartModel.updateDocument(newCartData, (err, result) => {
    if (err) {
      console.error("Error updating cart:", err);
      return res.status(400).json({ error: err.message || "Error updating cart" });
    }

    return res.status(200).json({
      message: "Documents updated successfully",
      tracking_id: result.tracking_id,
      updatedRows: result.affectedRows,
    });
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



module.exports = {
  createCartTable,
  getAllCart,
  getCartCount,
  deleteCart,
  deleteSingleCartItem,
  updateDocument,
};
