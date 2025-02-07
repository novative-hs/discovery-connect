const mysqlConnection = require("../config/db");

const createOrderTable = () => {
  const OrderTable = `
   CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,  
    user_id INT ,  
    total_amount DECIMAL(10, 2) ,  
    status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',  
    payment_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    delivery_date TIMESTAMP,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
    FOREIGN KEY (user_id) REFERENCES user_account(id),
    FOREIGN KEY (payment_id) REFERENCES payment(id)    
);

  `;

  mysqlConnection.query(OrderTable, (err, result) => {
    if (err) {
      console.error("Error creating OrderItem table:", err);
    } else {
      console.log("OrderItem table created or already exists.");
    }
  });
};
module.exports = { createOrderTable };
