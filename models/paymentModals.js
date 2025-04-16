const mysqlConnection = require("../config/db");

const createPaymentTable = () => {
  const paymentTable = `
    CREATE TABLE IF NOT EXISTS payment (
      id INT PRIMARY KEY AUTO_INCREMENT, 
      cardholder_name VARCHAR(225) NOT NULL,
      card_number VARCHAR(19) NOT NULL, 
      card_expiry DATE, 
      card_cvc VARCHAR(4) NOT NULL, 
      payment_type ENUM('Debit', 'Credit') NOT NULL,  
      payment_status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid'
    );
  `;

  mysqlConnection.query(paymentTable, (err, result) => {
    if (err) {
      console.error("Error creating payment table:", err);
    } else {
      console.log("Payment table created or already exists.");
    }
  });
};


const insertPaymentDetails = (data, callback) => {

  // Ensure card_expiry is in valid DATE format (YYYY-MM-DD)
  let formattedExpiry = `${data.card_expiry}-01`; // Adds "-01" to make it a full date

  // Query to check if payment details with the same card number already exist
  const checkExistingPaymentQuery = `
    SELECT id FROM payment 
    WHERE card_number = ? 
    LIMIT 1
  `;

  // Check if the card number already exists
  mysqlConnection.query(checkExistingPaymentQuery, [data.card_number], (err, result) => {
    if (err) {
      console.error("Error checking for existing payment details:", err);
      return callback(err, { status: 500, message: "Error checking payment details" });
    }

    if (result.length > 0) {
      // If payment details already exist, return the existing ID
      const existingPaymentId = result[0].id;
      return callback(null, { 
        status: 200, 
        message: "Payment details already exist for this card number",
        insertedId: existingPaymentId // Return the existing payment ID
      });
    }

    // If no existing payment found, proceed to insert the new payment details
    const insertQuery = `
      INSERT INTO payment (cardholder_name, card_number, card_expiry, card_cvc, payment_type, payment_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.cardholder_name,
      data.card_number,
      formattedExpiry,  // Fixed date format
      data.card_cvc,
      data.payment_type,
      data.payment_status,
    ];

    // Perform the insert
    mysqlConnection.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Error inserting payment details:", err);
        return callback(err, { status: 500, message: "Error inserting payment details" });
      }

      // Return the ID of the newly inserted payment record
      callback(null, { 
        status: 200, 
        message: "Payment details inserted successfully",
        insertedId: result.insertId  // Return the new payment ID
      });
    });
  });
};





module.exports = { createPaymentTable, insertPaymentDetails };
