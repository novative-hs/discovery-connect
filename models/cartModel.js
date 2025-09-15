const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");


const createCartTable = () => {
  const cartTableQuery = `
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    sample_id VARCHAR(36) NOT NULL,
    price FLOAT NOT NULL,
    quantity INT NOT NULL,
    VolumeUnit VARCHAR(20),
    volume VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sample_id) REFERENCES sample(id) ON DELETE CASCADE
  )`;

  mysqlConnection.query(cartTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating cart table:", err);
    } else {
      console.log("Cart table created or already exists.");
    }
  });
};

const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    mysqlConnection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const getAllCart = (id, callback) => {
  const sqlQuery = `
    SELECT 
        s.id AS sampleid, 
        s.Analyte AS Analyte,
        cs.CollectionSiteName,
        c.quantity AS samplequantity, 
        c.*,
        o.user_id AS order_user_id
    FROM cart c
    JOIN sample s ON c.sample_id = s.id
    JOIN collectionsite cs ON c.collectionsite_id = cs.user_account_id
    JOIN orders o ON c.order_id = o.id
    WHERE o.user_id = ?
  `;
  
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


const getCartCount = (userId, callback) => {
  const sqlQuery = `
    SELECT 
      COUNT(c.id) AS itemCount
    FROM orders o
    JOIN cart c ON o.id = c.order_id
    WHERE o.user_id = ?
  `;

  mysqlConnection.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching order items count:", err);
      callback(err, null);
    } else {
      callback(null, results[0].itemCount);
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
      console.error("Error deleting cart:", err);
    }
  });
};

const deleteSingleCartItem = (id, callback, res) => {
  const sqlQuery = `
      DELETE FROM cart 
  WHERE sample_id = ?;
      `;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error deleting cart item :", err);
    }
  });
};

const updateDocument = (newCartData, callback) => {
  if (!newCartData.tracking_id) {
    return callback(new Error("Tracking ID is required"), null);
  }

  const getCartIdQuery = `SELECT id FROM orders o WHERE o.tracking_id = ?`;
  mysqlConnection.query(getCartIdQuery, [newCartData.tracking_id], (err, results) => {
    if (err) {
      console.error("Error fetching cart ID:", err);
      return callback(new Error("Database error fetching cart ID"), null);
    }

    if (results.length === 0) {
      return callback(new Error("Cart not found for given tracking ID"), null);
    }

    // Loop over all cart IDs
    let insertedIds = [];
    let processed = 0;

    results.forEach((row) => {
      const sql = `
        INSERT INTO sampledocuments
        (order_id, study_copy, irb_file, nbc_file, added_by, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      mysqlConnection.query(
        sql,
        [
          row.id,
          newCartData.study_copy || null,
          newCartData.irb_file || null,
          newCartData.nbc_file || null,
          newCartData.added_by || null,
          "TechnicalAdmin"
        ],
        (insertErr, result) => {
          processed++;
          if (insertErr) {
            console.error("Error inserting updated documents for cart:", row.id, insertErr);
          } else {
            insertedIds.push(result.insertId);
          }

          // Callback after all inserts
          if (processed === results.length) {
            callback(null, {
              insertedIds,
              tracking_id: newCartData.tracking_id,
            });
          }
        }
      );
    });
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
