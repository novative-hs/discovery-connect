const mysqlConnection = require("../config/db");

// Function to create the organization table
const createOrganizationTable = () => {
  const organizationTable = `
    CREATE TABLE IF NOT EXISTS organization (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_account_id INT,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100),
        confirmPassword VARCHAR(100),
        accountType VARCHAR(255) NOT NULL,
        OrganizationName VARCHAR(100),
        type VARCHAR(50),
        HECPMDCRegistrationNo VARCHAR(50),
        ntnNumber VARCHAR(50),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        phoneNumber VARCHAR(15),
        status VARCHAR(50) DEFAULT 'pending',
        FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE
    )`;

  mysqlConnection.query(organizationTable, (err) => {
    if (err) {
      console.error("Error creating organization table: ", err);
    } else {
      console.log("Organization table created or already exists");
    }
  });
};

// Function to fetch all organizations
const getAllOrganizations = (callback) => {
  const query = "SELECT * FROM organization";
  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};

// Function to update organization status
const updateOrganizationStatus = (id, status, callback) => {
  const query = "UPDATE organization SET status = ? WHERE id = ?";
  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createOrganizationTable,
  getAllOrganizations,
  updateOrganizationStatus,
};
