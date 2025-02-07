
const mysqlConnection = require("../config/db");
// Function to create the QuantityUnit table
const createQuantityUnitTable = () => {
  const createQuantityUnitTable = `
    CREATE TABLE IF NOT EXISTS quantityunit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      added_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'inactive') DEFAULT 'active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES user_account(id) ON DELETE CASCADE
    )`;


  mysqlConnection.query(createQuantityUnitTable, (err, results) => {
    if (err) {
      console.error("Error creating Quantity Unit table: ", err);
    } else {
      console.log("Quantity Unit table created Successfully");
    }
  });
};

// Function to get all QuantityUnit 
const getAllQuantityUnit = (callback) => {
  const query = 'SELECT * FROM quantityunit WHERE status = "active"';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const createQuantityUnit= (data, callback, res) => {
  console.log('Received Request Body:', data); 

  const { bulkData, quantityunitname, added_by } = data || {};

  if (bulkData) {
    const uniqueData = Array.from(new Set(bulkData.map(JSON.stringify))).map(JSON.parse);
    const values = uniqueData.map(({ name, added_by }) => [name, added_by]);

    // Use ON DUPLICATE KEY UPDATE to prevent duplicate insertions
    const query = `
      INSERT INTO quantityunit (name, added_by)
      VALUES ?
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [values], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        console.log("Insert Result:", result); // Debugging result
        callback(null, result);
      }
    });
  } else if (quantityunitname && added_by) {
    const query = `
      INSERT INTO quantityunit (name, added_by)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = name;
    `;

    mysqlConnection.query(query, [quantityunitname, added_by], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  } else {
    callback(new Error('Invalid data'), null);
  }
};

// Function to update a QuantityUnit 
const updatequantityunit = (id, data, callback) => {
  const { quantityunitname, added_by } = data;
  const query = `
    UPDATE quantityunit
    SET name = ?, added_by = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [quantityunitname, added_by, id], (err, result) => {
    if (err) {
      console.error("Error in query:", err); // Log the error to debug
      callback(err, result);
    } else {
      callback(null, result);
    }
  });
};


// Function to delete a QuantityUnit 
const deleteQuantityUnit = (id, callback) => {
  const query = 'UPDATE quantityunit SET status = "inactive" WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};



module.exports = {
  createQuantityUnitTable,
  getAllQuantityUnit,
  updatequantityunit,
  createQuantityUnit,
  deleteQuantityUnit,
};