const mysqlConnection = require("../config/db");

function changepassword(data, callback) {
  const tables = [
    "user_account",
    "researcher",
    "collectionsite",
    "organization",
  ];

  const findUserQueries = tables.map(
    (table) => `SELECT email FROM ${table} WHERE email = ?`
  );

  const updateQueries = tables.map(
    (table) => `UPDATE ${table} SET password = ? WHERE email = ?`
  );

  // First, find where the user exists
  Promise.all(
    findUserQueries.map((query) =>
      new Promise((resolve, reject) => {
        mysqlConnection.query(query, [data.email], (err, result) => {
          if (err) {
            reject(err);
          } else if (result.length > 0) {
            resolve(true); // User exists in this table
          } else {
            resolve(false); // User does not exist in this table
          }
        });
      })
    )
  )
    .then((exists) => {
      const updatePromises = exists
        .map((existsInTable, index) => {
          if (existsInTable) {
            return new Promise((resolve, reject) => {
              mysqlConnection.query(
                updateQueries[index],
                [data.newPassword, data.email],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }
          return Promise.resolve(); // Skip updates for tables where the user doesn't exist
        })
        .filter(Boolean); // Remove skipped promises

      return Promise.all(updatePromises);
    })
    .then(() => {
      callback(null, { message: "Password updated successfully" });
    })
    .catch((err) => {
      console.error("Error updating password:", err);
      callback({ status: 500, message: "Update error" }, null);
    });
}

module.exports = {
  changepassword,F
};