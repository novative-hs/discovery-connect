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
      getCommitteeMembersQuery = "SELECT user_account_id, status FROM committee_member WHERE committeetype = 'Scientific'";
  } else if (committeeType === "ethical") {
      getCommitteeMembersQuery = "SELECT user_account_id, status FROM committee_member WHERE committeetype = 'Ethical'";
  } else if (committeeType === "both") {
      getCommitteeMembersQuery = "SELECT user_account_id, status FROM committee_member WHERE committeetype IN ('Scientific', 'Ethical')";
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
          // No members found for the given committee type
          if (committeeType === "scientific") {
              return callback(null, { message: "No scientific committee members found" });
          } else if (committeeType === "ethical") {
              return callback(null, { message: "No ethical committee members found" });
          } else if (committeeType === "both") {
              return callback(null, { message: "No committee members found for either type" });
          }
      }

      // Filter out inactive members
      const activeMembers = committeeMembers.filter(member => member.status !== 'inactive');

      if (activeMembers.length === 0) {
          // All members are inactive for the given type
          if (committeeType === "scientific") {
              return callback(null, { message: "All scientific committee members are inactive" });
          } else if (committeeType === "ethical") {
              return callback(null, { message: "All ethical committee members are inactive" });
          } else if (committeeType === "both") {
              return callback(null, { message: "All committee members are inactive" });
          }
      }

      // Insert into `committeesampleapproval` for each active committee member
      const insertQuery = `
          INSERT INTO committeesampleapproval (cart_id, sender_id, committee_member_id, committee_status)
          VALUES ?
      `;

      // Prepare the values for insertion (only for active members)
      const values = activeMembers.map(member => [cartId, senderId, member.user_account_id, "Review"]);

      // Insert active committee members into the database
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

    // ✅ If status is "Refused", update sample quantities
    if (committee_status.toLowerCase() === "refused") {
      const getQuantitySql = `
        SELECT sample_id, quantity 
        FROM cart 
        WHERE id = ?
      `;

      mysqlConnection.query(getQuantitySql, [id], (getErr, cartResults) => {
        if (getErr) {
          console.error("Error fetching cart item:", getErr);
          return callback(getErr, null);
        }

        if (cartResults.length > 0) {
          const { sample_id, quantity } = cartResults[0];

          const updateSampleSql = `
            UPDATE sample 
            SET quantity = quantity + ?, 
                quantity_allocated = quantity_allocated - ? 
            WHERE id = ?
          `;

          mysqlConnection.query(updateSampleSql, [quantity, quantity, sample_id], (updateErr, updateResults) => {
            if (updateErr) {
              console.error("Error updating sample quantities:", updateErr);
              return callback(updateErr, null);
            }

            console.log("Sample quantities updated due to refusal.");

            // After updating quantity, send email
            sendUserEmail(id, committee_status, comments, callback);
          });
        } else {
          console.log("No cart item found to adjust sample quantities.");
          sendUserEmail(id, committee_status, comments, callback);
        }
      });
    } else {
      // If not refused, directly send email
      sendUserEmail(id, committee_status, comments, callback);
    }
  });
};

// Helper function to fetch email and send notification
const sendUserEmail = (id, committee_status, comments, callback) => {
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

      sendEmail(userEmail, subject, text)
        .then(() => {
          console.log("Email notification sent successfully.");
          callback(null, { message: "Committee status updated successfully!" });
        })
        .catch((emailError) => {
          console.error("Failed to send email:", emailError);
          callback(emailError, null);
        });
    } else {
      console.log("No email found for user associated with this cart.");
      callback(null, { message: "Committee status updated successfully!" });
    }
  });
};



  
module.exports = {
createcommitteesampleapprovalTable,
 insertCommitteeApproval,
 updateCommitteeStatus
};