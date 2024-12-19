// models/researcherModel.js
const mysqlConnection = require("../config/db");

// Function to ensure the 'researcher' table exists
function createResearcherTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS researcher (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_account_id INT,
      email VARCHAR(100),
      password VARCHAR(100),
      confirmPassword VARCHAR(100),
      accountType VARCHAR(255),
      ResearcherName VARCHAR(100),
      phoneNumber VARCHAR(15),
      fullAddress TEXT,
      city VARCHAR(50),
      district VARCHAR(50),
      country VARCHAR(50),
      nameofOrganization VARCHAR(100),
      logo VARCHAR(255),
      age VARCHAR(100),
      gender VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      FOREIGN KEY (user_account_id) REFERENCES user_account(id) ON DELETE CASCADE 
    )
  `;
  mysqlConnection.query(query, (err, result) => {
    if (err) {
      console.error("Error creating researcher table:", err.message);
    } else {
      console.log("Researcher table initialized or already exists.");
    }
  });
}

// Function to insert a new researcher into the database
function createResearcher(data, callback) {
  const { ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo } = data;
  const query = `
    INSERT INTO researcher (ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(query, [ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo], callback);
}

// Function to fetch all researchers
function getAllResearchers(callback) {
  const query = 'SELECT * FROM researcher';
  mysqlConnection.query(query, callback);
}

// Function to fetch a single researcher by ID
function getResearcherById(id, callback) {
  const query = 'SELECT * FROM researcher WHERE id = ?';
  mysqlConnection.query(query, [id], callback);
}

// Function to update a researcher's details
function updateResearcher(id, data, callback) {
  const { ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo } = data;
  const query = `
    UPDATE researcher
    SET ResearcherName = ?, email = ?, gender = ?, phoneNumber = ?, nameofOrganization = ?, fullAddress = ?, country = ?, logo = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [ResearcherName, email, gender, phoneNumber, nameofOrganization, fullAddress, country, logo, id], callback);
}

// Function to delete a researcher by ID
function deleteResearcher(id, callback) {
  const query = 'DELETE FROM researcher WHERE id = ?';
  mysqlConnection.query(query, [id], callback);
}


// (Registration Admin) Function to update researcher status
function updateResearcherStatus(id, status, callback) {
  const query = 'UPDATE researcher SET status = ? WHERE id = ?';
  mysqlConnection.query(query, [status, id], callback);
}


module.exports = {
  createResearcherTable,
  createResearcher,
  getAllResearchers,
  getResearcherById,
  updateResearcher,
  deleteResearcher,
  updateResearcherStatus,
};
