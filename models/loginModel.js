const mysqlConnection = require("../config/db");

// Query to check login credentials in user_account, researcher, collectionsite, organization, and registrationadmin tables
function verifyUserLogin(email, password, callback) {
  const query = `
    SELECT 'researcher' AS accountType, id, email FROM researcher WHERE email = ? AND password = ?
    UNION
    SELECT 'collectionsite' AS accountType, id, email FROM collectionsite WHERE email = ? AND password = ?
    UNION
    SELECT 'organization' AS accountType, id, email FROM organization WHERE email = ? AND password = ?
    UNION
    SELECT 'registrationadmin' AS accountType, id, email FROM user_account WHERE email = ? AND password = ? AND accountType = 'registrationadmin'
  `;

  mysqlConnection.query(query, [email, password, email, password, email, password, email, password], (err, results) => {
    if (err) {
      console.error("Database query error:", err);  // Log the error
      return callback(err, null);  // Pass the error to the callback
    }

    console.log("Query Results:", results);  // Log the results to verify what data is returned
    callback(null, results);  // Pass the results to the callback
  });
}

module.exports = {
  verifyUserLogin,
};
