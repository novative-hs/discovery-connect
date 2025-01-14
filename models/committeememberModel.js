const mysqlConnection = require("../config/db");

// New Updated fields in Table
const addFieldToCommitteememberTable = (tableName, fieldName, fieldType) => {
  const checkColumnQuery = `
    SELECT COUNT(*) AS columnExists 
    FROM information_schema.columns 
    WHERE table_name = '${tableName}' 
    AND column_name = '${fieldName}'`;

  // Check if the column exists
  mysqlConnection.query(checkColumnQuery, (err, results) => {
    if (err) {
      console.error(`Error checking column existence for ${fieldName}:`, err);
    } else {
      const columnExists = results[0].columnExists;
      if (columnExists === 0) {
        const addFieldQuery = `
          ALTER TABLE ${tableName} 
          ADD COLUMN ${fieldName} ${fieldType}`;

        mysqlConnection.query(addFieldQuery, (err, results) => {
          if (err) {
            console.error(
              `Error altering ${tableName} table to add ${fieldName}:`,
              err
            );
          } else {
            console.log(`${fieldName} added to ${tableName} table.`);
          }
        });
      } else {
        console.log(
          `${fieldName} column already exists in ${tableName} table.`
        );
      }
    }
  });
};

// Add Field Names Here
const alterCommitteememberTable = () => {
  // addFieldToCommitteememberTable("committee_member", "CutOffRange", "VARCHAR(255)");
};

// Function to create the committee_member table
const createCommitteeMemberTable = () => {
  const committeememberTable = `
    CREATE TABLE IF NOT EXISTS committee_member (
        id INT AUTO_INCREMENT PRIMARY KEY,
        CommitteeMemberName VARCHAR(100),
        email VARCHAR(100),
       password VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(15),
        cnic VARCHAR(15),
        fullAddress TEXT,
        city INT,
      district INT,
      country INT,
        organization INT,
        committeetype VARCHAR(50),
        status VARCHAR(50) DEFAULT 'inactive',
          FOREIGN KEY (organization) REFERENCES organization(id) ON DELETE CASCADE,
         FOREIGN KEY (city) REFERENCES city(id) ON DELETE CASCADE,
      FOREIGN KEY (district) REFERENCES district(id) ON DELETE CASCADE,
      FOREIGN KEY (country) REFERENCES country(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  mysqlConnection.query(committeememberTable, (err, results) => {
    if (err) {
      console.error("Error creating committee member table: ", err);
    } else {
      console.log("Committee member table created or already exists");
    }
  });
  alterCommitteememberTable();
};

// Function to get all committee members
const getAllCommitteeMembers = (callback) => {
  const query = `
SELECT 
    cm.*,
    c.id AS city_id,
    c.name AS city_name,
    d.id AS district_id,
    d.name AS district_name,
    ctr.id AS country_id,
    ctr.name AS country_name,
    org.id AS organization_id,
    org.OrganizationName AS organization_name
FROM 
    committee_member cm
JOIN 
    city c ON cm.city = c.id
JOIN 
    district d ON cm.district = d.id
JOIN 
    country ctr ON cm.country = ctr.id
JOIN 
    organization org ON cm.organization = org.id;
`;
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
  const {
    CommitteeMemberName,
    email,
    password,
    phoneNumber,
    cnic,
    fullAddress,
    city,
    district,
    country,
    organization,
  } = data;
  const query = `
    INSERT INTO committee_member (CommitteeMemberName, email,password, phoneNumber, cnic, fullAddress, city, district, country, organization)
    VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?)
  `;
  mysqlConnection.query(
    query,
    [
      CommitteeMemberName,
      email,
      password,
      phoneNumber,
      cnic,
      fullAddress,
      city,
      district,
      country,
      organization,
    ],
    (err, result) => {
      callback(err, result);
    }
  );
};

// Function to update a committee member
const updateCommitteeMember = (id, data, callback) => {
  const {
    CommitteeMemberName,
    email,
    password,
    phoneNumber,
    cnic,
    fullAddress,
    city,
    district,
    country,
    organization,
  } = data;
  const query = `
    UPDATE committee_member
    SET CommitteeMemberName = ?, email = ?,password=?, phoneNumber = ?, cnic = ?, fullAddress = ?, city = ?, district = ?, country = ?, organization = ?
    WHERE id = ?
  `;
  mysqlConnection.query(
    query,
    [
      CommitteeMemberName,
      email,
      password,
      phoneNumber,
      cnic,
      fullAddress,
      city,
      district,
      country,
      organization,
      id,
    ],
    (err, result) => {
      callback(err, result);
    }
  );
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
    .join(", ");
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
  const query = "DELETE FROM committee_member WHERE id = ?";
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
  deleteCommitteeMember,
};