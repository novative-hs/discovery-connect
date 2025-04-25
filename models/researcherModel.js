const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");

function createResearcher(data, callback) {
  console.log("Researcher Model", data)
  const { userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo, added_by } = data;
  const query = `
    INSERT INTO researcher (user_account_id, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo, added_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlConnection.query(query, [userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo, added_by], callback);
}

// Function to fetch all researchers
function getAllResearchers(callback) {
  const query = `
    SELECT researcher.id,researcher.added_by,researcher.created_at, researcher.ResearcherName, researcher.phoneNumber, researcher.fullAddress, researcher.city, researcher.district, researcher.country, researcher.nameofOrganization, researcher.status,
           user_account.email,
           organization.id AS organization_id, organization.OrganizationName
    FROM researcher
    JOIN user_account ON researcher.user_account_id = user_account.id
    JOIN organization ON researcher.nameofOrganization = organization.id
    ORDER BY researcher.id DESC
  `;
  mysqlConnection.query(query, callback);
}


function getResearchersByOrganization(organizationId, callback) {
  const query = `
    SELECT 
    researcher.*,
    city.id AS city_id,
    city.name AS city_name,
    district.id AS district_id,
    district.name AS district_name,
    country.id AS country_id,
    country.name AS country_name,
    organization.id AS organization_id,
    user_account.email,
    user_account.password,
    organization.OrganizationName AS organization_name,
    user_account.created_at,
    user_account.updated_at
FROM 
    researcher
LEFT JOIN city ON researcher.city = city.id
LEFT JOIN district ON researcher.district = district.id
LEFT JOIN country ON researcher.country = country.id
LEFT JOIN organization ON researcher.nameofOrganization = organization.id
LEFT JOIN user_account ON researcher.user_account_id = user_account.id
 WHERE 
      researcher.nameofOrganization = ?
    ORDER BY 
      researcher.id DESC;
  `;
  mysqlConnection.query(query, [organizationId], callback);
}

// Function to fetch a single researcher by ID
function getResearcherById(id, callback) {
  const query = `SELECT 
    researcher.*,
    city.id AS cityid,
    city.name AS cityname,
    district.id AS districtid,
    district.name AS districtname,
    country.id AS countryid,
    country.name AS countryname,
    organization.id AS organization_id,
    organization.OrganizationName AS OrganizationName,
    user_account.email AS useraccount_email
FROM 
    researcher
LEFT JOIN city ON researcher.city = city.id
LEFT JOIN district ON researcher.district = district.id
LEFT JOIN country ON researcher.country = country.id
LEFT JOIN organization ON researcher.nameofOrganization = organization.id
LEFT JOIN user_account ON researcher.user_account_id = user_account.id
WHERE 
    researcher.user_account_id = ?;
  `;
  mysqlConnection.query(query, id, callback);
}


// Function to update a researcher's details
function updateResearcher(id, data, callback) {
  const { userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo } = data;
  console.log(data)
  const query = `
    UPDATE researcher
    SET ResearcherName = ?, phoneNumber = ?, nameofOrganization = ?, fullAddress = ?,city=?,district=?, country = ?, logo = ?
    WHERE id = ?
  `;
  mysqlConnection.query(query, [ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo, id], callback);
}


function updateResearcherDetail(id, data, callback) {
  const { userID, ResearcherName, phoneNumber, nameofOrganization, fullAddress, city, district, country, logo } = data;




  mysqlConnection.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return callback(err);
    }

    // Update user_account email
    const updateEmailQuery = `
      UPDATE user_account
      SET email = ?
      WHERE id = ?
    `;

    mysqlConnection.query(updateEmailQuery, [useraccount_email, id], (err, result) => {
      if (err) {
        return mysqlConnection.rollback(() => {
          console.error('Error updating email:', err);
          return callback(err);
        });
      }

      // Now update the collectionsite table, passing file path for logo
      const updateCollectionSiteQuery = `
        UPDATE collectionsite
        SET
          CollectionSiteName = ?,
          phoneNumber = ?,
          ntnNumber = ?,
          fullAddress = ?,
          city = ?,
          district = ?,
          country = ?,
          type = ?,
          logo = ?  
        WHERE user_account_id = ?
      `;

      mysqlConnection.query(
        updateCollectionSiteQuery,
        [CollectionSiteName, phoneNumber, ntnNumber, fullAddress, cityid, districtid, countryid, type, file, id],
        (err, result) => {
          if (err) {
            return mysqlConnection.rollback(() => {
              console.error('Error updating collectionsite:', err);
              return callback(err);
            });
          }

          // Commit the transaction if both queries succeed
          mysqlConnection.commit((err) => {
            if (err) {
              return mysqlConnection.rollback(() => {
                console.error('Error committing transaction:', err);
                return callback(err);
              });
            }

            console.log('Both email and collectionsite updated successfully');
            return callback(null, 'Both updates were successful');
          });
        }
      );
    });
  });
}

const deleteResearcher = async (id) => {
  const updateQuery = 'UPDATE researcher SET status = ? WHERE id = ?';
  const getEmailQuery = `
    SELECT ua.email ,r.ResearcherName
    FROM researcher r
    JOIN user_account ua ON r.user_account_id = ua.id
    WHERE r.id = ?
  `;

  try {
    // Set the status here (e.g., 'unapproved' for deletion)
    const status = 'unapproved';

    // Update researcher status
    const [updateResult] = await mysqlConnection.promise().query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No researcher found with the given ID.");
    }

    // Fetch email in parallel
    const [emailResults] = await mysqlConnection.promise().query(getEmailQuery, [id]);

    // Check if email exists
    if (emailResults.length === 0) {
      throw new Error("Researcher email not found.");
    }

    const email = emailResults[0].email;
    const name = emailResults[0].ResearcherName;

    // Construct the email content based on the status
    let emailText = `
    Dear ${name},

    Thank you for registering with Discovery Connect! 

    We appreciate your interest in our platform. However, we regret to inform you that your account is currently **unapproved**. This means that you will not be able to log in or access the platform until the admin completes the review and approval process.

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
    return { message: "Researcher status updated and email sent successfully." };
  } catch (error) {
    console.error("Error updating researcher status:", error);
    throw error;
  }
};


// (Registration Admin) Function to update researcher status
const updateResearcherStatus = async (id, status) => {
  const updateQuery = "UPDATE researcher SET status = ? WHERE id = ?";
  const insertHistoryQuery = `
    INSERT INTO registrationadmin_history (resaercher_id, status, updated_at)
    VALUES (?, ?, NOW())
  `;
  const getEmailQuery = `
    SELECT ua.email ,r.ResearcherName
    FROM researcher r
    JOIN user_account ua ON r.user_account_id = ua.id
    WHERE r.id = ?
  `;

  const conn = await mysqlConnection.promise().getConnection();

  try {
    // Start transaction
    await conn.beginTransaction();

    const [updateResult] = await conn.query(updateQuery, [status, id]);
    if (updateResult.affectedRows === 0) {
      throw new Error("No researcher found with the given ID.");
    }

    const [insertResult] = await conn.query(insertHistoryQuery, [id, status]);
    const [emailResults] = await conn.query(getEmailQuery, [id]);

    if (emailResults.length === 0) {
      throw new Error("Researcher email not found.");
    }

    await conn.commit();
    conn.release(); // Release the connection

    const email = emailResults[0].email;
    const name = emailResults[0].ResearcherName;

    let emailText = `
    Dear ${name},
  
    We hope this message finds you well! 
  
    We would like to update you about the status of your Researcher account. 
  
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
  
    We are thrilled to inform you that your Researcher account has been successfully <b>approved</b>! You can now log in and access your account to manage your information and interact with the Discovery Connect platform.
  
    Here are a few next steps:
    - Log in to your account and explore all the features: [Log in to Discovery Connect](http://discovery-connect.com/login).
    - Get in touch with our support team if you have any questions or need assistance.
  
    We are excited to have you on board and look forward to seeing how you’ll benefit from our platform!
  
    Best regards,
    The Discovery Connect Team
  `;

    }

    sendEmail(email, "Welcome to Discovery Connect", emailText)
      .then(() => console.log("Email sent successfully"))
      .catch((emailErr) => console.error("Error sending email:", emailErr));

    return { message: "Status updated and email sent" };
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error("Error updating researcher status:", error);
    throw error;
  }
};


module.exports = {
  createResearcher,
  updateResearcherDetail,
  getResearchersByOrganization,
  getAllResearchers,
  getResearcherById,
  updateResearcher,
  deleteResearcher,
  updateResearcherStatus,
};
