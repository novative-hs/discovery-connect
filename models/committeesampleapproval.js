const mysqlConnection = require("../config/db");

const createcommitteesampleapprovalTable = () => {
  const committeesampleapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS committeesampleapproval (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,  
  sender_id INT NOT NULL,  -- Registration admin
  committee_member_id INT NOT NULL, -- Committee member
  committee_status ENUM('Pending', 'Approved', 'Refused') NOT NULL DEFAULT 'Pending',
  comments TEXT NULL, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES user_account(id) ON DELETE CASCADE,
  FOREIGN KEY (committee_member_id) REFERENCES user_account(id) ON DELETE CASCADE
);

`;

  mysqlConnection.query(committeesampleapprovalableQuery, (err, result) => {
    if (err) {
      console.error("Error creating committee sample approval table:", err);
    } else {
      console.log("Sample Approval table created or already exists.");
    }
  });
};
const insertCommitteeApproval = (cartId, senderId, committeeType, callback) => {
  let getCommitteeMembersQuery = "";

  // Determine which committee members to fetch, excluding inactive members
  if (committeeType === "scientific") {
      getCommitteeMembersQuery = "SELECT user_account_id FROM committee_member WHERE committeetype = 'Scientific' AND status != 'inactive'";
  } else if (committeeType === "ethical") {
      getCommitteeMembersQuery = "SELECT user_account_id FROM committee_member WHERE committeetype = 'Ethical' AND status != 'inactive'";
  } else if (committeeType === "both") {
      getCommitteeMembersQuery = "SELECT user_account_id FROM committee_member WHERE committeetype IN ('Scientific', 'Ethical') AND status != 'inactive'";
  } else {
      return callback(new Error("Invalid committee type"), null);
  }

  // Fetch committee members
  mysqlConnection.query(getCommitteeMembersQuery, (err, committeeMembers) => {
      if (err) {
          console.error("Error fetching committee members:", err);
          return callback(err, null);
      }

      if (committeeMembers.length === 0) {
          return callback(new Error("No active committee members found for the given type"), null);
      }

      // Insert into `committeesampleapproval` for each committee member
      const insertQuery = `
          INSERT INTO committeesampleapproval (cart_id, sender_id, committee_member_id, committee_status)
          VALUES ?
      `;

      // Use the correct property: `user_account_id`
      const values = committeeMembers.map(member => [cartId, senderId, member.user_account_id, "Pending"]);

      mysqlConnection.query(insertQuery, [values], (insertErr, result) => {
          if (insertErr) {
              console.error("Error inserting committee approval records:", insertErr);
              return callback(insertErr, null);
          }

          console.log(`Inserted ${result.affectedRows} records into committeesampleapproval.`);
          callback(null, result);
      });
  });
};

const updateCommitteeStatus = (id, committee_member_id,committee_status, comments, callback) => {
  console.log("Received Body", committee_status);

  const sqlQuery = `
    UPDATE committeesampleapproval 
    SET committee_status = ?, comments = ?
    WHERE committee_member_id = ? AND cart_id = ?
  `;

  mysqlConnection.query(sqlQuery, [committee_status, comments,committee_member_id, id], (err, results) => {
    if (err) {
      console.error("Error updating committee status:", err);
      return callback(err, null);
    }

    console.log("Committee Status updated successfully!");
    callback(null, { message: "Committee status updated successfully!" });
  });
};

  
module.exports = {
createcommitteesampleapprovalTable,
 insertCommitteeApproval,
 updateCommitteeStatus
};