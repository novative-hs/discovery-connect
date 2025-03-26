const mysqlConnection = require("../config/db");

const createPaymentTable = () => {
  const paymentTable = `
   CREATE TABLE IF NOT EXISTS payment (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    cardholder_name VARCHAR(225),
    cart_id INT NULL,
    card_number VARCHAR(19) NOT NULL,
    card_expiry DATE, 
    card_cvc VARCHAR(4), 
    payment_type ENUM('Debit', 'Credit') NOT NULL,  
    payment_status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE SET NULL
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
  console.log("Incoming Payment Data:", data);

  // Ensure card_expiry is in valid DATE format (YYYY-MM-DD)
  let formattedExpiry = `${data.card_expiry}-01`; // Adds "-01" to make it a full date

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

  mysqlConnection.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Error inserting payment details:", err);
      return callback(err, { status: 500, message: "Error inserting payment details" });
    }
    callback(null, { 
      status: 200, 
      message: "Payment details inserted successfully",
      insertedId: result.insertId  
    });
  });
};




module.exports = { createPaymentTable, insertPaymentDetails };
