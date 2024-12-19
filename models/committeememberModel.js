const mysqlConnection = require("../config/db");

// Function to create the committee_member table
const createCommitteeMemberTable = () => {
  const committeememberTable = `
    CREATE TABLE IF NOT EXISTS committee_member (
        id INT AUTO_INCREMENT PRIMARY KEY,
        CommitteeMemberName VARCHAR(100),
        email VARCHAR(100),
        phoneNumber VARCHAR(15),
        cnic VARCHAR(15),
        fullAddress TEXT,
        city VARCHAR(50),
        district VARCHAR(50),
        country VARCHAR(50),
        organization VARCHAR(50),
        committeetype VARCHAR(50),
        status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  mysqlConnection.query(committeememberTable, (err, results) => {
    if (err) {
      console.error("Error creating committee member table: ", err);
    } else {
      console.log("Committee member table created or already exists");
    }
  });
};

// Function to get all committee members
const getAllCommitteeMembers = (callback) => {
  const query = 'SELECT * FROM committee_member';
  mysqlConnection.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Function to insert a new committee member
const createCommitteeMember = (data, callback) => {
  const { CommitteeMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization } = data;
  const query = `
    INSERT INTO committee_member (CommitteeMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(query, [CommitteeMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization], (err, result) => {
    callback(err, result);
  });
};

// Function to update a committee member
const updateCommitteeMember = (id, data, callback) => {
  const { CommitteeMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization } = data;
  const query = `
    UPDATE committee_member
    SET CommitteeMemberName = ?, email = ?, phoneNumber = ?, cnic = ?, fullAddress = ?, city = ?, district = ?, country = ?, organization = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [CommitteeMemberName, email, phoneNumber, cnic, fullAddress, city, district, country, organization, id], (err, result) => {
    callback(err, result);
  });
};

// Function to update a committee member's status
const updateCommitteeMemberStatus = (id, status, callback) => {
  const query = `
    UPDATE committee_member
    SET status = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
};

// Function to update a committee member's type
const updateCommitteeMemberType = (id, updateFields, callback) => {
  // Construct the dynamic query for updating only the provided fields
  const setClause = Object.keys(updateFields)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updateFields);
  values.push(id); // Add the ID to the query parameters

  const query = `
    UPDATE committee_member
    SET ${setClause}
    WHERE id = ?
  `;

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
};

// Function to delete a committee member
const deleteCommitteeMember = (id, callback) => {
  const query = 'DELETE FROM committee_member WHERE id = ?';
  mysqlConnection.query(query, [id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  createCommitteeMemberTable,
  getAllCommitteeMembers,
  createCommitteeMember,
  updateCommitteeMember,
  updateCommitteeMemberStatus,
  updateCommitteeMemberType,
  deleteCommitteeMember
};
