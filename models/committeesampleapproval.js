const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
const createcommitteesampleapprovalTable = () => {
  const committeesampleapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS committeesampleapproval (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,  
  sender_id INT NOT NULL,  -- Registration admin
  committee_member_id INT NOT NULL, -- Committee member
  committee_status ENUM('UnderReview', 'Approved', 'Refused') NOT NULL DEFAULT 'UnderReview',
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

  if (committeeType === "scientific") {
    getCommitteeMembersQuery = "SELECT user_account_id, status, committeetype FROM committee_member WHERE committeetype = 'Scientific'";
  } else if (committeeType === "ethical") {
    getCommitteeMembersQuery = "SELECT user_account_id, status, committeetype FROM committee_member WHERE committeetype = 'Ethical'";
  } else if (committeeType === "both") {
    getCommitteeMembersQuery = "SELECT user_account_id, status, committeetype FROM committee_member WHERE committeetype IN ('Scientific', 'Ethical')";
  } else {
    return callback(new Error("Invalid committee type"), null);
  }

  mysqlConnection.query(getCommitteeMembersQuery, (err, committeeMembers) => {
    if (err) {
      console.error("Error fetching committee members:", err);
      return callback(err, null);
    }

    if (committeeMembers.length === 0) {
      const msg = committeeType === "both" ?
        "No scientific or ethical committee members found." :
        `No ${committeeType} committee members found.`;
      return callback(null, { message: msg });
    }

    const activeMembers = committeeMembers.filter(member => member.status !== 'inactive');

    if (activeMembers.length === 0) {
      const types = [...new Set(committeeMembers.map(m => m.committeetype))];
      const allInactiveMessage = types.length === 2 ?
        "All scientific and ethical committee members are inactive." :
        `All ${types[0]} committee members are inactive.`;
      return callback(null, { message: allInactiveMessage });
    }

    // Inform which committees were missing or inactive
    let notice = "";
    if (committeeType === "both") {
      const foundTypes = new Set(activeMembers.map(m => m.committeetype));
      if (!foundTypes.has("Scientific") && foundTypes.has("Ethical")) {
        notice = "Only Ethical Committee Members were found. ";
      } else if (!foundTypes.has("Ethical") && foundTypes.has("Scientific")) {
        notice = "Only Scientific Committee Members were found. ";
      }
    }

    const insertQuery = `
      INSERT INTO committeesampleapproval (cart_id, sender_id, committee_member_id, committee_status)
      VALUES ?
    `;
    const values = activeMembers.map(member => [cartId, senderId, member.user_account_id, "UnderReview"]);

    mysqlConnection.query(insertQuery, [values], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error inserting committee approval records:", insertErr);
        return callback(insertErr, null);
      }



      const updateCartStatusQuery = `
        UPDATE cart
        SET order_status = 'Pending'
        WHERE id = ?
      `;

      mysqlConnection.query(updateCartStatusQuery, [cartId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating cart status:", updateErr);
          return callback(updateErr, null);
        }



        const getEmailQuery = `
          SELECT ua.email,c.tracking_id
          FROM user_account ua
          JOIN cart c ON ua.id = c.user_id
          WHERE c.id = ?
        `;

        mysqlConnection.query(getEmailQuery, [cartId], (emailErr, emailResults) => {
          if (emailErr) {
            console.error("Error fetching user email:", emailErr);
            return callback(emailErr, null);
          }

          const userEmail = emailResults?.[0]?.email;
          const tracking_id = emailResults?.[0]?.tracking_id;
          const subject = "Committee Status Update";
          const text = `Dear User,\n\nYour sample request (Tracking ID: ${tracking_id}) is now under review by the committee.\n\nPlease check your dashboard for further updates.\n\nRegards,\nDiscovery Connect Team`;

          if (userEmail) {
            sendEmail(userEmail, subject, text)
              .then(() => {

                return callback(null, {
                  message: notice + "Committee status updated and email sent successfully!"
                });
              })
              .catch((emailError) => {
                console.error("Failed to send email:", emailError);
                return callback(null, {
                  message: notice + "Committee status updated, but email failed to send."
                });
              });
          } else {
            return callback(null, {
              message: notice + "Committee status updated successfully, but no user email found."
            });
          }
        });
      });
    });
  });
};




const updateCommitteeStatus = async (cartId, committee_member_id, committee_status, comments, callback) => {
  const updateQuery = `
    UPDATE committeesampleapproval 
    SET committee_status = ?, comments = ? 
    WHERE committee_member_id = ? AND cart_id = ?`;

  mysqlConnection.query(updateQuery, [committee_status, comments, committee_member_id, cartId], async (err, result) => {
    if (err) {
      console.error("Error updating committee status:", err);
      return callback(err, null);
    }

    if (committee_status === 'Refused') {
      try {
        revertSampleQuantity(cartId);
      } catch (revertErr) {
        console.error("❌ Error reverting sample quantity:", revertErr);
      }
    }

    // Check if all committee members have submitted status
    const checkAllStatusQuery = `
      SELECT COUNT(*) AS pending 
      FROM committeesampleapproval 
      WHERE cart_id = ? AND committee_status IS NULL`;

    mysqlConnection.query(checkAllStatusQuery, [cartId], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking committee status completion:", checkErr);
        return callback(checkErr, null);
      }

      const pending = checkResult[0].pending;

      // Only proceed if all members submitted status
      if (pending === 0) {
        const getEmailQuery = `
          SELECT ua.email, c.tracking_id 
          FROM user_account ua
          JOIN cart c ON ua.id = c.user_id 
          WHERE c.id = ?`;

        mysqlConnection.query(getEmailQuery, [cartId], (emailErr, emailResults) => {
          if (emailErr) {
            console.error("Error fetching email:", emailErr);
          } else if (emailResults.length > 0) {
            const { email: userEmail, tracking_id } = emailResults[0];

            // Update cart order_status to "underreview"
            const updateCartStatusQuery = `UPDATE cart SET order_status = 'UnderReview' WHERE id = ?`;
            mysqlConnection.query(updateCartStatusQuery, [cartId], (cartErr) => {
              if (cartErr) {
                console.error("Failed to update cart status:", cartErr);
              }
            });

            const subject = `Committee Status Update`;
            const text = `<b>Dear Researcher,</b><br><br>Your sample request for <b>Tracking ID: ${tracking_id}</b> has been reviewed by all committee members.<br><br>📝 <b>Latest Comment:</b> ${comments}<br><br>Please check your <b>dashboard</b> for details. 🚀`;

            sendEmail(userEmail, subject, text, (emailSendErr) => {
              if (emailSendErr) {
                console.error("Failed to send email:", emailSendErr);
              }
            });
          } else {
            console.warn("No email found for cart ID", cartId);
          }
        });
      }

      // Final callback
      const response = {
        success: true,
        message: "Committee status updated",
        cartId,
        status: committee_status,
      };
      callback(null, response);
    });
  });
};



const revertSampleQuantity = (cartId) => {
  const cartQuery = `SELECT sample_id, quantity FROM cart WHERE id = ?`;

  mysqlConnection.query(cartQuery, [cartId], (cartErr, cartResults) => {
    if (cartErr) {
      console.error("❌ Error fetching cart item:", cartErr);
      return;
    }

    if (cartResults.length === 0) {
      console.warn("❌ Cart item not found for rejection.");
      return;
    }

    const cartItem = cartResults[0];
    const qty = Number(cartItem.quantity) || 0;
    const sampleId = cartItem.sample_id;

    const sampleQuery = `SELECT quantity, quantity_allocated FROM sample WHERE id = ?`;
    mysqlConnection.query(sampleQuery, [sampleId], (sampleErr, sampleResults) => {
      if (sampleErr) {
        console.error("❌ Error fetching sample:", sampleErr);
        return;
      }

      if (sampleResults.length === 0) {
        console.warn("❌ Sample not found.");
        return;
      }

      const sample = sampleResults[0];
      const shouldRevert = sample.quantity_allocated >= qty;

      if (!shouldRevert) {
        console.warn("⚠️ Not enough allocated stock to revert. Skipping.");
        return;
      }

      const updateQuery = `
        UPDATE sample
        SET quantity = quantity + ?,
            quantity_allocated = quantity_allocated - ?
        WHERE id = ?`;

      mysqlConnection.query(updateQuery, [qty, qty, sampleId], (updateErr, updateResults) => {
        if (updateErr) {
          console.error("❌ Error updating sample quantity:", updateErr);
        } else {
          console.log("✅ Sample quantity successfully reverted.");
        }
      });
    });
  });
};


// Helper function to fetch email and send notification
// const sendUserEmail = (id, committee_status, comments, callback) => {
//   const getEmailQuery = `
//     SELECT ua.email 
//     FROM user_account ua
//     JOIN cart c ON ua.id = c.user_id
//     WHERE c.id = ?
//   `;

//   mysqlConnection.query(getEmailQuery, [id], (emailErr, emailResults) => {
//     if (emailErr) {
//       console.error("Error fetching user email:", emailErr);
//       return callback(emailErr, null);
//     }

//     if (emailResults.length > 0) {
//       const userEmail = emailResults[0].email;
//       const subject = `Committee Status Update`;
//       const text = `Dear User, your sample request for cart ID ${id} has been updated by a committee member.\n\nStatus: ${committee_status}\nComments: ${comments}\n\nPlease check your dashboard for details.`;

//       sendEmail(userEmail, subject, text)
//         .then(() => {

//           callback(null, { message: "Committee status updated successfully!" });
//         })
//         .catch((emailError) => {
//           console.error("Failed to send email:", emailError);
//           callback(emailError, null);
//         });
//     } else {

//       callback(null, { message: "Committee status updated successfully!" });
//     }
//   });
// };

module.exports = {
  createcommitteesampleapprovalTable,
  insertCommitteeApproval,
  updateCommitteeStatus
};