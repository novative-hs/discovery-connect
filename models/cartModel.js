const mysqlConnection = require("../config/db");

const createCartTable = () => {
  const cartTableQuery = `
   CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  sample_id INT,
  price FLOAT,
  quantity INT,
  type VARCHAR(255),
  totalpayment DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_account(id),
  FOREIGN KEY (sample_id) REFERENCES sample(id)
    )`;

  mysqlConnection.query(cartTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating cart table:", err);
    } else {
      console.log("Cart table created or already exists.");
    }
  });
};
const createCart = (data, callback) => {
  const { researcher_id, id, price, samplequantity, total } =
    data;

  const insertQuery = `
    INSERT INTO cart (user_id, sample_id, price, quantity, totalpayment)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [researcher_id, id, price, samplequantity, total];

  mysqlConnection.query(insertQuery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      // After inserting, get the updated cart count
      const countQuery = `SELECT COUNT(*) AS cartCount FROM cart`;

      mysqlConnection.query(countQuery, (err, countResults) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, {
            message: "Item added successfully",
            cartCount: countResults[0].cartCount,
          });
        }
      });
    }
  });
};

const getAllCart = (id, callback, res) => {
  const sqlQuery = `
SELECT 
      s.id AS sampleid, 
      s.samplename AS samplename,
      s.discount AS discount,
      s.SamplePriceCurrency AS Currency,
      s.quantity AS stock, 
      s.user_account_id AS user_account_id,
      cs.CollectionSiteName,
      c.quantity AS samplequantity, 
      c.id,c.user_id,
      c.sample_id,
      c.price,
      c.type,
      c.totalpayment
  FROM cart c
  JOIN sample s ON c.sample_id = s.id
  JOIN user_account ua ON s.user_account_id = ua.id
  JOIN collectionsite cs ON ua.id = cs.user_account_id
  WHERE c.user_id = ?

`;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      console.log(results);
      callback(null, results);
    } else {
      callback(null, results);
    }
  });
};
const getCartCount = (id, callback, res) => {
  const sqlQuery = `
    
 SELECT 
      count(c.id) as Count
  FROM cart c
  WHERE c.user_id = ?
  `;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(err, results[0]);
    } else {
      callback(null, results);
    }
  });
};

const deleteCart = (id, callback, res) => {
  const sqlQuery = `
    DELETE FROM cart 
WHERE user_id = ?;
    `;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      callback(err, results);
      console.error("Error deleting cart:", err);
    } else {
      const countQuery = `SELECT COUNT(*) AS cartCount FROM cart`;

      mysqlConnection.query(countQuery, (err, countResults) => {
        if (err) {
          console.error("Error counting cart items:", err);
          return callback(err, null);
        }

        const cartCount = countResults[0].cartCount;
        // Return success response with remaining cart count
        callback(null, { message: "Item deleted successfully", cartCount });
      });
    }
  });
};

const deleteSingleCartItem = (id, callback) => {
  const deleteQuery = `DELETE FROM cart WHERE sample_id = ?`;

  mysqlConnection.query(deleteQuery, [id], (err, deleteResults) => {
    if (err) {
      console.error("Error deleting cart item:", err);
      return callback(err, null);
    }

    // Query to count remaining items in the cart
    const countQuery = `SELECT COUNT(*) AS cartCount FROM cart`;

    mysqlConnection.query(countQuery, (err, countResults) => {
      if (err) {
        console.error("Error counting cart items:", err);
        return callback(err, null);
      }

      const cartCount = countResults[0].cartCount;
      // Return success response with remaining cart count
      callback(null, { message: "Item deleted successfully", cartCount });
    });
  });
};

const updateCart = (id, data, callback, res) => {
  const { price, discount, samplequantity } = data;

  // Calculate the total after applying the discount
  const discountedPrice = price * (1 - discount / 100);
  const total = discountedPrice * samplequantity;

  const updateQuery = `
    UPDATE cart 
    SET quantity = ?, 
        totalpayment = ?
    WHERE sample_id = ?
  `;

  const values = [
    samplequantity,
    total, // Keep total without rounding
    id,
  ];

  mysqlConnection.query(updateQuery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  createCartTable,
  getAllCart,
  createCart,
  getCartCount,
  deleteCart,
  deleteSingleCartItem,
  updateCart,
};
