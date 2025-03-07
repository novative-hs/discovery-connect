const mysqlConnection = require("../config/db");
const {sendEmail}=require("../config/email");
// Function to fetch all organizations
const getAllOrganizations = (callback) => {
  const query = "SELECT organization.*, user_account.email AS email FROM organization JOIN user_account ON organization.user_account_id = user_account.id ORDER BY OrganizationName ASC";
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
const updateOrganizationStatus = async (id, status) => {
  return new Promise((resolve, reject) => {
    const updateQuery = "UPDATE organization SET status = ? WHERE id = ?";

    mysqlConnection.query(updateQuery, [status, id], (err, results) => {
      if (err) return reject(err);
      if (results.affectedRows === 0) {
        return reject(new Error("No organization found with the given ID."));
      }

      // Fetch organization's email
      const getEmailQuery = `SELECT ua.email 
       FROM organization o
       JOIN user_account ua ON o.user_account_id = ua.id
       WHERE o.id = ?`;
      mysqlConnection.query(getEmailQuery, [id], async (err, emailResults) => {
        if (err) return reject(err);
        if (emailResults.length === 0) return reject(new Error("Organization email not found."));

        const email = emailResults[0].email;

        let emailText = `Dear Collectionsite,\n\nYour account status is currently pending. 
        Please wait for approval.\n\nBest regards,\nYour Company`;

        if (status === "approved") {
          emailText = `Dear Collectionsite,\n\nYour account has been approved! 
          You can now log in and access your account.\n\nBest regards,\nYour Company`;
        }

        try {
          await sendEmail(email, "Welcome to Discovery Connect", emailText);
          resolve({ message: "Status updated and email sent" });
        } catch (emailErr) {
          console.error("Error sending email:", emailErr);
          reject(emailErr);
        }
      });
    });
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
