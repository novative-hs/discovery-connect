const mysqlConnection = require("../config/db");

const createOrderItemTable = () => {
  const OrderItemTable = `
   CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    sample_id INT NOT NULL,  
    price FLOAT NOT NULL,  
    quantity INT NOT NULL,  
    type VARCHAR(255),  
    total DECIMAL(10, 2) NOT NULL,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   
    FOREIGN KEY (sample_id) REFERENCES sample(id)  
)
  `;

  mysqlConnection.query(OrderItemTable, (err, result) => {
    if (err) {
      console.error("Error creating OrderItem table:", err);
    } else {
      console.log("OrderItem table created or already exists.");
    }
  });
};
module.exports = { createOrderItemTable };
