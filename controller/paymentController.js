const paymentModel = require('../models/paymentModals');

const moment = require('moment');

// Controller for creating the sample table
const createPaymentTable = (req, res,callback) => {
    paymentModel.createPaymentTable();
    res.status(200).json({ message: "Payment table creation process started" });

};

// Controller to create a payment detail
const insertPaymentDetails = (req, res) => {
  const paymentData = req.body;
  const { id } = req.params;

  console.log("Controller Received data:", paymentData);

  paymentModel.insertPaymentDetails(id, paymentData, (err, result) => {
    if (err) {
      return res.status(result.status || 500).json({ message: result.message });
    }
    res.status(200).json(result);
  });
};






module.exports = {
  createPaymentTable,
  insertPaymentDetails,
  
};