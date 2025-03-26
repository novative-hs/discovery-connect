const mysqlConnection = require("../config/db");
const mysqlPool = require("../config/db");


// Function to create the contactus table
const createContactUsTable = () => {
    const createContactUsQuery = `
      CREATE TABLE IF NOT EXISTS contact_us (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        company VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        added_by VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    mysqlConnection.query(createContactUsQuery, (err, results) => {
        if (err) {
            console.error("Error creating contact_us table: ", err);
        } else {
            console.log("contact_us table created successfully");
        }
    });
};


function saveContactUs(data, callback) {
    const insertQuery = `INSERT INTO contact_us (name, email, phone, company, message) VALUES (?, ?, ?, ?, ?)`;

    mysqlConnection.query(insertQuery, [data.name, data.email, data.phone, data.company, data.message], (err, result) => {
        if (err) {
            console.error("Error saving contact form:", err);
            return callback({ status: 500, message: "Database error" }, null);
        }
        return callback(null, { message: "Contact form submitted successfully." });
    });
}
const getAllContactus = (callback) => {
    const query = 'SELECT * FROM contact_us ORDER BY id ASC';
    mysqlConnection.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  };
  

module.exports = {
    saveContactUs,
    createContactUsTable,
    getAllContactus
};
