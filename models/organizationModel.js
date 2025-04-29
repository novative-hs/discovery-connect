const mysqlConnection = require("../config/db");
const {sendEmail}=require("../config/email");
// Function to fetch all organizations
const getAllOrganizations = (callback) => {
  const query = "SELECT organization.*, user_account.email AS email FROM organization JOIN user_account ON organization.user_account_id = user_account.id ORDER BY organization.id DESC";
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

  - **Status:** Pending Approval

  Your account is currently <b>pending</b> approval. Rest assured, we are reviewing your details, and you will be notified once your account has been approved. In the meantime, please feel free to reach out to us if you have any questions or require further assistance.

  Thank you for your patience and cooperation.

  Best regards,
  The Discovery Connect Team
`;

if (status === "approved") {
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
const deleteOrganization = async (id) => {
  const updateQuery = 'UPDATE organization SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email ,o.OrganizationName
    FROM organization o
    JOIN user_account ua ON o.user_account_id = ua.id
    WHERE o.id = ?
  `;

  try {
    // Set the status here (e.g., 'unapproved' for deletion)
    const status = 'unapproved';

    // Update organization status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No organization found with the given ID.");
    }

    // Fetch email in parallel
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);

    // Check if email exists
    if (emailResults.length === 0) {
      throw new Error("Organization email not found.");
    }

    const email = emailResults[0].email;
    const name=emailResults[0].OrganizationName;

    // Construct the email content based on the status
    let emailText = `
    Dear ${name},
  
    Thank you for registering with Discovery Connect! 
  
    We appreciate your interest in our platform. However, we regret to inform you that your account is currently <b>unapproved</b>. This means that you will not be able to log in or access the platform until the admin completes the review and approval process.
  
    We understand this might be disappointing, but rest assured, we are working hard to process your registration as quickly as possible.
  
    Once your account is approved, you'll be able to explore all the exciting features and resources that Discovery Connect has to offer!
  
    We will notify you via email as soon as your account is approved. In the meantime, if you have any questions or need further assistance, feel free to reach out to us.
  
    We appreciate your patience and look forward to having you on board soon!
  
    Best regards,
    The Discovery Connect Team
    `;
  
  

    // Send email asynchronously (does not block response)
    sendEmail(email, "Account Status Update", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    // Final response (status update and email sent)
    return { message: "Status updated and email sent" };
  } catch (error) {
    console.error("Error updating organization status:", error);
    throw error;
  }
};



module.exports = {
  getCurrentOrganizationById,
  deleteOrganization,
  getOrganizationById,
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganization
};
