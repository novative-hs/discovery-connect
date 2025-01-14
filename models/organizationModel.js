const mysqlConnection = require("../config/db");

// Function to fetch all organizations
const getAllOrganizations = (callback) => {
  const query = "SELECT organization.*, user_account.email AS email FROM organization JOIN user_account ON organization.user_account_id = user_account.id";
  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};

function getCurrentOrganizationById(id, callback) {
  const query = 'SELECT o.*,  c.id AS cityid, c.name AS cityname, cnt.id AS countryid, cnt.name AS countryname, d.id AS districtid, d.name AS districtname, ua.email AS useraccount_email FROM organization o JOIN city c ON o.city = c.id JOIN country cnt ON o.country = cnt.id JOIN district d ON o.district = d.id JOIN user_account ua ON o.user_account_id = ua.id WHERE o.user_account_id = ?';
  mysqlConnection.query(query, [id], callback);
} 
function getOrganizationById(id, callback) {
  const query = 'SELECT * FROM organization WHERE id = ?';
  mysqlConnection.query(query, [id], callback);
} 

// Function to update organization status
const updateOrganizationStatus = (id, status, callback) => {
  const query = "UPDATE organization SET status = ? WHERE id = ?";
  mysqlConnection.query(query, [status, id], (err, result) => {
    callback(err, result);
  });
};

const updateOrganization = (data, user_account_id, callback) => {
  const {
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    ntnNumber,
    useraccount_email, 
  } = data;

  const query = `
    UPDATE organization AS org
    JOIN user_account AS ua ON ua.id = org.user_account_id
    SET 
      org.OrganizationName = ?, 
      org.type = ?, 
      org.HECPMDCRegistrationNo = ?, 
      org.phoneNumber = ?, 
      org.fullAddress = ?, 
      org.city = ?, 
      org.district = ?, 
      org.country = ?, 
      org.ntnNumber = ?, 
      ua.email = ?
    WHERE org.user_account_id= ?;
  `;

  const values = [
    OrganizationName,
    type,
    HECPMDCRegistrationNo,
    phoneNumber,
    fullAddress,
    city,
    district,
    country,
    ntnNumber,
    useraccount_email,
    user_account_id,
  ];

  mysqlConnection.query(query, values, (err, result) => {
    callback(err, result);
  });
  console.log("quesry",query,values)
};

// Function to delete a collection site
const deleteOrganization = (id, callback) => {
  const query = 'UPDATE organization SET status = ? WHERE id = ?';
  mysqlConnection.query(query, ['unapproved', id], (err, result) => {
    callback(err, result);
  });
};

module.exports = {
  getCurrentOrganizationById,
  deleteOrganization,
  getOrganizationById,
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganization
};
