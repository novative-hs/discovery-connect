const orderModel = require("../models/orderModel")
const createOrder = (req, res) => {
  const {
    researcher_id,
    payment_id,
    cart_items,
    reporting_mechanism,
    sample_id,
    subtotal,
    totalpayment,
     // ✅ Tax
      tax_value,
      tax_type,

      // ✅ Platform
      platform_value,
      platform_type,

      // ✅ Freight
      freight_value,
      freight_type
  } = req.body;

  // Read files from req.files
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

  // Parse sample_id (optional)
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
    sample_ids: sampleIds,
    cart_items: cartItems,
    reporting_mechanism,
    study_copy,
    irb_file,
    nbc_file,
    subtotal,
    totalpayment,
     // ✅ Tax
      tax_value,
      tax_type,

      // ✅ Platform
      platform_value,
      platform_type,

      // ✅ Freight
      freight_value,
      freight_type
  };
  // ✅ Call the model using callback
  orderModel.createOrder(newCartData, (err, result) => {
    if (err) {
      console.error("Error creating order:", err);
      return res.status(400).json({ error: err.message || "Error creating Order" });
    }

    return res.status(201).json({
      message: result.message,
      order_id: result.order_id,
      tracking_id: result.tracking_id,
      created_at: result.created_at,
    });
  });
};



const getOrderByResearcher = (req, res) => {
    const { id } = req.params; // Get user ID from request parameters

    if (!id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    orderModel.getOrderByResearcher(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error fetching sample", details: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "No samplesdddddd found" });
        }
        res.status(200).json(results);
    });
};

const getOrderByCSR = (req, res) => {
    const csrUserId = req.query.csrUserId;
    const staffAction = req.query.staffAction; // get staffAction from query

    if (!csrUserId) {
        return res.status(400).json({ error: "CSR user ID is required" });
    }

    orderModel.getOrderByCSR(csrUserId, staffAction, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error fetching order packing list" });
        }
        res.status(200).json(results);
    });
};


const updateCartStatusbyCSR = (req, res) => {
    const dispatchSlip = req.files?.["dispatchSlip"] ? req.files["dispatchSlip"][0].buffer : null;
    orderModel.updateCartStatusbyCSR(req, dispatchSlip, (err, result) => {
        if (err) {
            console.error("Error updating order status CSR:", err);
            return res.status(500).json({ error: "Error in updating order by CSR" });
        }

        res.status(200).json({ message: result });
    });
};

const updateOrderStatus = (req, res) => {
    try {
        let { orderid, cartStatus, deliveryDate, deliveryTime } = req.body;

        if (!cartStatus) {
            return res.status(400).json({ message: "cartStatus is required" });
        }

        // File handling
        const dispatchSlip = req.files?.dispatchSlip
            ? req.files.dispatchSlip[0].buffer
            : null;

        orderModel.updateOrderStatus(orderid, cartStatus, deliveryDate, deliveryTime, dispatchSlip, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err });
            }
            res.status(200).json({ message: "Cart status updated successfully" });
        });
    } catch (error) {
        console.error("Error in updateCartStatus:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getAllSampleinDiscover = (req, res) => {
    // Get filters
    const ageMin = req.query.ageMin ? parseInt(req.query.ageMin) : null;
    const ageMax = req.query.ageMax ? parseInt(req.query.ageMax) : null;
    const gender = req.query.gender || null;
    const sampleType = req.query.sampleType || null;
    const smokingStatus = req.query.smokingStatus || null;
    const search = req.query.search || null;
    const TestResult = req.query.TestResult || null;
    const exactAge = req.query.age ? parseInt(req.query.age) : null;


    // Now pass these to your model function
    orderModel.getAllSampleinDiscover(
        { ageMin, ageMax, exactAge, gender, sampleType, smokingStatus, search, TestResult },
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Error fetching samples detail" });
            }

            res.status(200).json({
                data: results.data,
                total: results.total,
            });
        }
    );
};
module.exports = {
    createOrder,
    getOrderByResearcher,
    getOrderByCSR,
    updateCartStatusbyCSR,
    updateOrderStatus,
    getAllSampleinDiscover
}