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
  if (!researcher_id || !payment_id) {
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
  tracking_id: result.tracking_id,
  created_at:result.created_at
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


const updateCartStatusToShipping = (cartId, callback) => {
  const committeeStatusQuery = `
    SELECT 
      (SELECT COUNT(*) FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND ca.committee_status IN ('Refused', 'Rejected')) AS any_rejected,

      (SELECT COUNT(*) FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Ethical' AND ca.committee_status = 'Approved') AS ethical_approved,

      (SELECT COUNT(*) FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Scientific' AND ca.committee_status = 'Approved') AS scientific_approved,

      (SELECT COUNT(*) FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Ethical') AS ethical_total,

      (SELECT COUNT(*) FROM committeesampleapproval ca
       JOIN committee_member cm ON cm.user_account_id = ca.committee_member_id
       WHERE ca.cart_id = ? AND cm.committeetype = 'Scientific') AS scientific_total,

      c.order_status AS current_order_status
    FROM cart c WHERE c.id = ?`;

  mysqlConnection.query(
    committeeStatusQuery,
    [cartId, cartId, cartId, cartId, cartId, cartId],
    (err, results) => {
      if (err) return callback(err, null);

      const {
        any_rejected,
        ethical_approved,
        scientific_approved,
        ethical_total,
        scientific_total,
        current_order_status
      } = results[0];

      // ✅ Reject if any member rejected/refused
      if (Number(any_rejected) > 0 && current_order_status !== "Rejected") {
        const rejectQuery = `UPDATE cart SET order_status = 'Rejected' WHERE id = ?`;
        return mysqlConnection.query(rejectQuery, [cartId], (rejectErr, rejectResults) => {
          if (rejectErr) return callback(rejectErr, null);
          return callback(null, rejectResults);
        });
      }

      const ethicalApprovedComplete = ethical_total === 0 || ethical_approved === ethical_total;
      const scientificApprovedComplete = scientific_total === 0 || scientific_approved === scientific_total;

      if (ethical_total === 0 && scientific_total === 0) {
        return callback(null, null); // ✅ No approvals required
      }

      // ✅ If fully approved and not already dispatched/shipped
      if (ethicalApprovedComplete && scientificApprovedComplete) {
        if (current_order_status !== "Shipped" && current_order_status !== "Dispatched") {
          const updateStatusQuery = `UPDATE cart SET order_status = 'Dispatched' WHERE id = ?`;

          mysqlConnection.query(updateStatusQuery, [cartId], (updateErr, updateResults) => {
            if (updateErr) return callback(updateErr, null);

            const getResearcherEmailQuery = `
              SELECT ua.email, c.tracking_id,c.created_at, c.id AS cartId
              FROM user_account ua
              JOIN cart c ON ua.id = c.user_id
              WHERE c.id = ?`;

            mysqlConnection.query(getResearcherEmailQuery, [cartId], (emailErr, emailResults) => {
              if (emailErr) return callback(emailErr, null);

              if (emailResults.length === 0) {
                console.warn("No researcher found for this cart ID");
                return callback(null, updateResults);
              }

              const { email: researcherEmail, tracking_id,created_at: cartCreatedAt } = emailResults[0];
              const subject = "Sample Request Status Update";
              const message = `Dear Researcher,\n\nYour sample request is now being processed for <b>Dispatched</b>.\n\nDetails:\nCart ID: ${tracking_id} (Created At: ${cartCreatedAt})\n\nBest regards,\nYour Team`;

              setImmediate(() => {
                sendEmail(researcherEmail, subject, message, (emailSendErr) => {
                  if (emailSendErr) {
                    console.error("❌ Failed to send email:", emailSendErr);
                  }
                });
              });

              return callback(null, updateResults);
            });
          });
        } else {
          return callback(null, null); // ✅ Already updated
        }
      } else {
        return callback(null, null); // ❌ Not fully approved yet
      }
    }
  );
};

const updateTechnicalAdminStatus = async (req, res) => {
  const { order_ids, technical_admin_status, comment } = req.body;

  if (!technical_admin_status || !Array.isArray(order_ids) || order_ids.length === 0) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    await cartModel.updateTechnicalAdminStatus(order_ids, technical_admin_status, comment || null);

    return res.status(200).json({ message: "All statuses updated successfully" });
  } catch (err) {
    console.error("Error in bulk update:", err);
    return res.status(500).json({ error: "Bulk update failed" });
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
