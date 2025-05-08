const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
// Function to fetch all organizations
const getAllOrganizations = (callback) => {
  const query = `
    SELECT 
      organization.*, 
      user_account.id AS user_account_id, 
      user_account.email AS useraccount_email, 
      user_account.password AS useraccount_password,
      city.name AS city,
      city.id AS cityid,
      district.name AS district,
      district.id AS districtid,
      country.name AS country,
      country.id AS countryid
    FROM organization 
    JOIN user_account ON organization.user_account_id = user_account.id
    LEFT JOIN city ON organization.city = city.id
    LEFT JOIN district ON organization.district = district.id
    LEFT JOIN country ON organization.country = country.id
    ORDER BY organization.id DESC
  `;

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
  const insertHistoryQuery = `
  INSERT INTO databaseadmin_history (organization_id, status)
  VALUES (?, ?)
`;
  const updateQuery = "UPDATE organization SET status = ? WHERE id = ?";
  const getEmailQuery = `
    SELECT ua.email ,o.OrganizationName
    FROM organization o
    JOIN user_account ua ON o.user_account_id = ua.id
    WHERE o.id = ?
  `;

  try {
    // Update organization status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No organization found with the given ID.");
    }
    const [insertResult] = await mysqlConnection.promise().query(insertHistoryQuery, [id, status]);
    // Fetch email in parallel
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);

    // Check if email exists
    if (emailResults.length === 0) {
      throw new Error("Organization email not found.");
    }

    const email = emailResults[0].email;
    const name=emailResults[0].OrganizationName;
    let emailText = `
  Dear ${name},

  We hope this message finds you well! 

  We would like to update you about the status of your organization’s account. 

  - **Status:** InActive

  Your account is currently <b>inactive</b>. Rest assured, we are reviewing your details, and you will be notified once your account has been approved. In the meantime, please feel free to reach out to us if you have any questions or require further assistance.

  Thank you for your patience and cooperation.

  Best regards,
  The Discovery Connect Team
`;

if (status === "active") {
  emailText = `
  Dear ${name},

  Congratulations! 🎉

  We are thrilled to inform you that your organization’s account has been successfully <b>approved</b>! You can now log in and access your account to manage your information and interact with the Discovery Connect platform.

  Here are a few next steps:
  - Log in to your account and explore all the features: [Log in to Discovery Connect](http://discovery-connect.com/login).
  - Get in touch with our support team if you have any questions or need assistance.

  We are excited to have you on board and look forward to seeing how you’ll benefit from our platform!

  Best regards,
  The Discovery Connect Team
`;

}


    // Send email asynchronously (does not block response)
    sendEmail(email, "Welcome to Discovery Connect", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating organization status:", error);
    throw error;
  }
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

};

// Function to delete a collection site
const deleteOrganization = async (id, status) => {
  const insertHistoryQuery = `
  INSERT INTO databaseadmin_history (organization_id, status)
  VALUES (?, ?)
`;
  const updateQuery = 'UPDATE organization SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email, o.OrganizationName
    FROM organization o
    JOIN user_account ua ON o.user_account_id = ua.id
    WHERE o.id = ?
  `;
  try {
    // Update organization status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No organization found with the given ID.");
    }
    // Fetch email
    const [insertResult] = await mysqlConnection.promise().query(insertHistoryQuery, [id, status]);
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);
    if (emailResults.length === 0) {
      throw new Error("Organization email not found.");
    }
    const email = emailResults[0].email;
    const name = emailResults[0].OrganizationName;

    // Construct email content based on status
    let emailText = "";
    if (status === "inactive") {
      emailText = `
      Dear ${name},
      
      We hope you're doing well.

      We wanted to inform you that your organization's account on Discovery Connect has been set to <b>inactive</b>. This means you will no longer be able to access the platform or its services until reactivation.

      If you believe this was done in error or you need further assistance, please reach out to our support team.

      Thank you for being a part of Discovery Connect.

      Best regards,  
      The Discovery Connect Team
      `;
    } 

    // Send email asynchronously
    sendEmail(email, "Account Status Update", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating organization status:", error);
    throw error;
  }
};

module.exports = {
  getCurrentOrganizationById,
  getOrganizationById,
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganization
};
