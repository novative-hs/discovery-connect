const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
const createcommitteesampleapprovalTable = () => {
  const committeesampleapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS committeesampleapproval (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,  
  sender_id INT NOT NULL,  -- Registration admin
  committee_member_id INT NOT NULL, -- Committee member
  committee_status ENUM('Review', 'Approved', 'Refused') NOT NULL DEFAULT 'Review',
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

      // Prepare the values for insertion
      const values = committeeMembers.map(member => [cartId, senderId, member.user_account_id, "Review"]);

      mysqlConnection.query(insertQuery, [values], (insertErr, result) => {
          if (insertErr) {
              console.error("Error inserting committee approval records:", insertErr);
              return callback(insertErr, null);
          }

          console.log(`Inserted ${result.affectedRows} records into committeesampleapproval.`);

          // Update cart order status to "UnderReview"
          const updateCartStatusQuery = `
              UPDATE cart
              SET order_status = 'UnderReview'
              WHERE id = ?
          `;

          mysqlConnection.query(updateCartStatusQuery, [cartId], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error("Error updating cart status:", updateErr);
                  return callback(updateErr, null);
              }

              console.log("Cart order status updated to 'UnderReview'");
              callback(null, result);
          });
      });
  });
};


const updateCommitteeStatus = (id, committee_member_id, committee_status, comments, callback) => {
  console.log("Received Body", committee_status);

  const sqlQuery = `
    UPDATE committeesampleapproval 
    SET committee_status = ?, comments = ?
    WHERE committee_member_id = ? AND cart_id = ?
  `;

  mysqlConnection.query(sqlQuery, [committee_status, comments, committee_member_id, id], (err, results) => {
    if (err) {
      console.error("Error updating committee status:", err);
      return callback(err, null);
    }

    console.log("Committee Status updated successfully!");

    // ✅ Fetch user email after status update
    const getEmailQuery = `
      SELECT ua.email 
      FROM user_account ua
      JOIN cart c ON ua.id = c.user_id
      WHERE c.id = ?
    `;

    mysqlConnection.query(getEmailQuery, [id], (emailErr, emailResults) => {
      if (emailErr) {
        console.error("Error fetching user email:", emailErr);
        return callback(emailErr, null);
      }

      if (emailResults.length > 0) {
        const userEmail = emailResults[0].email;
        const subject = `Committee Status Update`;
        const text = `Dear User, your sample request for cart ID ${id} has been updated by a committee member.\n\nStatus: ${committee_status}\nComments: ${comments}\n\nPlease check your dashboard for details.`;

        // ✅ Send email notification
        sendEmail(userEmail, subject, text)
          .then(() => console.log("Email notification sent successfully."))
          .catch((emailError) => console.error("Failed to send email:", emailError));
      } else {
        console.log("No email found for user associated with this cart.");
      }

      // ✅ Callback after email operation
      callback(null, { message: "Committee status updated successfully!" });
    });
  });
};


  
module.exports = {
createcommitteesampleapprovalTable,
 insertCommitteeApproval,
 updateCommitteeStatus
};