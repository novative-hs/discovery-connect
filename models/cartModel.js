const mysqlConnection = require("../config/db");


const createCartTable = () => {
  const cartTableQuery = `
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    sample_id VARCHAR(36),
    price FLOAT,
    quantity INT,
    payment_method VARCHAR(255),
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


// cartModel.js
const createCart = (data, callback) => {
  console.log("Incoming request body:", data);

  const { researcher_id, cart_items, payment_method } = data;

  if (!researcher_id || !cart_items || !payment_method) {
    return callback(new Error("Missing required fields"));
  }

  let insertCount = 0;
  let errors = [];

  cart_items.forEach((item) => {
    const insertQuery = `
      INSERT INTO cart (user_id, sample_id, price, quantity, payment_method, totalpayment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [
      researcher_id,
      item.sample_id || null,
      item.price,
      item.samplequantity,
      payment_method,
      item.total,
    ];

    mysqlConnection.query(insertQuery, insertValues, (err) => {
      if (err) {
        console.error("Error inserting into cart:", err);
        errors.push(err);
      }

      if (errors.length > 0) return callback(errors[0]); // Return first error

      // **Step 2: Update stock only if insert succeeds**
      const updateQuery = `
        UPDATE sample 
        SET quantity = quantity - ? 
        WHERE id = ? AND quantity >= ?
      `;
      const updateValues = [item.samplequantity, item.sample_id, item.samplequantity];

      mysqlConnection.query(updateQuery, updateValues, (err, result) => {
        if (err || result.affectedRows === 0) {
          console.error("Error updating sample quantity or insufficient stock:", err);
          errors.push(err || new Error("Insufficient stock"));
        }

        insertCount++;

        // **Final callback after all insertions & updates**
        if (insertCount === cart_items.length && errors.length === 0) {
          callback(null, { message: "Cart items added successfully and stock updated" });
        } else if (insertCount === cart_items.length) {
          callback(errors[0]); // Return first encountered error
        }
      });
    });
  });
};


const getAllCart = (id, callback, res) => {
  const sqlQuery = `
  SELECT 
      s.id AS sampleid, 
      s.samplename AS samplename,
      s.discount AS discount,
      s. user_account_id AS user_account_id,
      cs.CollectionSiteName,
      c.quantity AS samplequantity, 
      c.*
  FROM cart c
  JOIN sample s ON c.sample_id = s.id
  JOIN collectionsite cs ON c.collectionsite_id = cs.user_account_id
  WHERE c.user_id = ?
`;
  mysqlConnection.query(sqlQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(null, results);
    }
    else{
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
      callback(err, results);
    }
    else{
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
      console.error("Error deleting cart:", err);
    } else {
      console.log("Cart deleted successfully", results);
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
    } else {
      console.log("Cart Item deleted successfully", results);
    }
  });
};
const updateCart = (id,data, callback, res) => {
  const {
    researcher_id,
    user_account_id,
    price,
    samplequantity,
    total,
  } = data;

  const updateQuery = `
    UPDATE cart 
    SET price = ?, quantity = ?, totalpayment = ?
    WHERE user_id = ? AND sample_id = ? AND collectionsite_id = ?
  `;

  const values = [
    price,
    samplequantity,
    total,
    researcher_id,
    id,
    user_account_id,
  ];

  console.log(updateQuery, values);
  mysqlConnection.query(updateQuery, values, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      console.log("Update Result:", result); // Debugging result
      callback(null, result);
    }
  });
};
const getAllOrder = (callback, res) => {
  const sqlQuery = `
  SELECT 
    o.id, 
    o.user_id, 
    u.email AS user_email,
    r.ResearcherName AS researcher_name, 
    o.sample_id, 
    s.samplename, 
    s.age,s.gender,s.ethnicity,s.samplecondition,s.storagetemp,s.ContainerType,s.CountryofCollection,s.QuantityUnit,
    s.SampleTypeMatrix,s.SmokingStatus,s.AlcoholOrDrugAbuse,s.InfectiousDiseaseTesting,s.InfectiousDiseaseResult,
    s.FreezeThawCycles,s.DateofCollection,s.ConcurrentMedicalConditions,s.ConcurrentMedications,s.DiagnosisTestParameter,
    s.TestResult,s.TestResultUnit,s.TestMethod,s.TestKitManufacturer,s.TestSystem,TestSystemManufacturer,s.SamplePriceCurrency,
    o.price, 
    o.quantity, 
    o.payment_method, 
    o.totalpayment, 
    o.created_at
FROM cart o
JOIN user_account u ON o.user_id = u.id
LEFT JOIN researcher r ON u.id = r.user_account_id 
JOIN sample s ON o.sample_id = s.id
ORDER BY o.created_at DESC;

`;
  mysqlConnection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching cart data:", err);
      callback(err, null);
    }
    else{
      callback(null, results);
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
  getAllOrder
};
