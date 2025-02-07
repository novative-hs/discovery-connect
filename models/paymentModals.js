const mysqlConnection = require("../config/db");

const createPaymentTable = () => {
  const paymentTable = `
    CREATE TABLE payment (
    id INT PRIMARY KEY AUTO_INCREMENT, 
    user_id INT NOT NULL, 
    card_number VARCHAR(16) NOT NULL,  
    card_expiry VARCHAR(7), 
    card_cvc VARCHAR(3), 
    payment_type ENUM('Debit', 'Credit') NOT NULL,  
    FOREIGN KEY (user_id) REFERENCES user_account(id) 
)
  `;

  mysqlConnection.query(paymentTable, (err, result) => {
    if (err) {
      console.log("Already exist");
    } else {
      console.log("Payment table created or already exists.");
    }
  });
};

const insertPaymentDetails = (id, data, callback) => {
  const findUserQuery = `SELECT COUNT(*) AS count FROM payment WHERE user_id = ?`;
  const insertQuery = `INSERT INTO payment (user_id, card_number, card_expiry, card_cvc, payment_type) VALUES (?, ?, ?, ?, ?)`;
  const values = [id, data.card_number, data.card_expiry, data.card_cvc, data.payment_type];

  mysqlConnection.query(findUserQuery, [id], (err, result) => {
    if (err) {
      return callback(err, { status: 500, message: "Database query error" });
    }

    const userExists = result[0].count > 0;

    if (userExists) {
      return callback(err, { status: 400, message: "Payment details already exist" });
    }

    // Insert new payment details
    mysqlConnection.query(insertQuery, values, (err) => {
      if (err) {
        return callback(err, { status: 500, message: "Error inserting payment details" });
      }
      callback(null, { status: 200, message: "Payment details inserted successfully" });
    });
  });
};



module.exports = { createPaymentTable, insertPaymentDetails };
