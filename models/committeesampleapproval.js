const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
const createcommitteesampleapprovalTable = () => {
  const committeesampleapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS committeesampleapproval (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,  
  sender_id INT NOT NULL,  -- Registration admin
  committee_member_id INT NOT NULL, 
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
const insertCommitteeApproval = (cartIds, senderId, committeeType, callback) => {
  // Validate input
  if (!Array.isArray(cartIds) || cartIds.length === 0) {
    return callback(new Error("No cart IDs provided"), null);
  }

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
    const values = [];
    cartIds.forEach(cartId => {
      activeMembers.forEach(member => {
        values.push([cartId, senderId, member.user_account_id, "Pending"]);
      });
    });


    mysqlConnection.query(insertQuery, [values], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error inserting committee approval records:", insertErr);
        return callback(insertErr, null);
      }
      const updateCartStatusQuery = `
  UPDATE cart
  SET order_status = 'Pending'
  WHERE id IN (?)
`;

      mysqlConnection.query(updateCartStatusQuery, [cartIds], (updateErr) => {

        if (updateErr) {
          console.error("Error updating cart status:", updateErr);
          return callback(updateErr, null);
        }



        const getEmailQuery = `
  SELECT DISTINCT ua.email, r.researcherName, c.tracking_id
  FROM user_account ua
  JOIN cart c ON ua.id = c.user_id
  JOIN researcher r ON ua.id = r.user_account_id
  WHERE c.id IN (?)
`;

        mysqlConnection.query(getEmailQuery, [cartIds], async (emailErr, emailResults) => {
          if (emailErr) {
            console.error("Error fetching user emails:", emailErr);
            return callback(emailErr, null);
          }

          // Group by email and researcherName
          const emailMap = new Map();

          emailResults.forEach(({ email, researcherName, tracking_id }) => {
            const key = `${email}|${researcherName}`;
            if (!emailMap.has(key)) {
              emailMap.set(key, []);
            }
            emailMap.get(key).push(tracking_id);
          });

          let emailFailures = [];

          for (const [key, trackingIds] of emailMap.entries()) {
            const [email, researcherName] = key.split("|");

            const subject = "Your Sample Submission is Under Review";

            const text = `
 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2c3e50;">Sample Request Under Review</h2>

      <p>Dear <strong>${researcherName}</strong>,</p>

      <p>We are writing to inform you that the following sample request(s) you submitted are now <strong>under review</strong> by the committee:</p>

      <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        Tracking ID(s): ${trackingIds.join(', ')}
      </ul>

      <p>You can log in to your dashboard for further updates and to track the status of each request.</p>

      <p style="margin-top: 30px;">Thank you for using <strong>Discovery Connect</strong>.</p>

      <p style="color: #7f8c8d;">Best regards,<br/>Discovery Connect Team</p>
    </div>
    `.trim();

            try {
              await sendEmail(email, subject, text);
            } catch (err) {
              console.error("Failed to send email to", email, ":", err);
              emailFailures.push(email);
            }
          }

          const finalMsg =
            notice +
            "Committee status updated" +
            (emailFailures.length > 0
              ? `, but email failed to send to: ${emailFailures.join(", ")}.`
              : " and emails sent successfully!");

          return callback(null, { message: finalMsg });
        });


      });
    });
  });
};




const updateCommitteeStatus = async (cart_ids, committee_member_id, committee_status, comments, callback) => {

  if (!Array.isArray(cart_ids) || cart_ids.length === 0) {
    return callback(new Error("Invalid input: cart_ids must be a non-empty array"), null);
  }
  const getCommitteeTypeQuery = `SELECT committeetype FROM committee_member WHERE user_account_id = ?`;
  const committeeTypeResult = await new Promise((resolve) => {
    mysqlConnection.query(getCommitteeTypeQuery, [committee_member_id], (err, result) => {
      if (err) {
        console.error("Error fetching committee type:", err);
        return resolve([]);
      }
      resolve(result);
    });
  });

  const committeeType = (committeeTypeResult[0]?.committeetype);

  const pendingEmailCarts = [];

  let processed = 0;
  const total = cart_ids.length;
  let hasError = false;

  for (const cartid of cart_ids) {

    const updateQuery = `
      UPDATE committeesampleapproval 
      SET committee_status = ?, comments = ? ,
     Approval_date = NOW()
      WHERE committee_member_id = ? AND cart_id = ?`;

    await new Promise((resolve) => {
      mysqlConnection.query(updateQuery, [committee_status, comments, committee_member_id, cartid], async (err) => {
        if (err) {
          console.error(`Error updating committee status for cart ${cartid}:`, err);
          hasError = true;
          return resolve();
        }

        if (committee_status === 'Refused') {
          try {
            revertSampleQuantity(cartid);
          } catch (revertErr) {
            console.error(`❌ Error reverting quantity for cart ${cartid}:`, revertErr);
          }
        }

        // Check if all committee members submitted
        const checkAllStatusQuery = `
          SELECT COUNT(*) AS pending 
          FROM committeesampleapproval 
          WHERE cart_id = ? AND committee_status IS NULL`;

        mysqlConnection.query(checkAllStatusQuery, [cartid], (checkErr, checkResult) => {
          if (checkErr) {
            console.error(`Error checking committee status for cart ${cartid}:`, checkErr);
            hasError = true;
            return resolve();
          }

          const pending = checkResult[0].pending;
          if (pending === 0) {
            pendingEmailCarts.push({ cartId: cartid, latestComment: comments });
          }

          resolve();
        });
      });
    });

    processed++;
  }

  // Now send emails only once per cart
  const emailMap = new Map();

  for (const { cartId, latestComment } of pendingEmailCarts) {
    const getEmailQuery = `
    SELECT ua.email, r.researcherName, c.tracking_id 
    FROM user_account ua
    JOIN cart c ON ua.id = c.user_id 
    JOIN researcher r ON ua.id = r.user_account_id
    WHERE c.id = ?`;

    const results = await new Promise((resolve) => {
      mysqlConnection.query(getEmailQuery, [cartId], (err, result) => {
        if (err) {
          console.error("Error fetching email:", err);
          return resolve([]);
        }
        resolve(result);
      });
    });

    if (results.length > 0) {
      const { email, researcherName, tracking_id } = results[0];

      if (!emailMap.has(email)) {
        emailMap.set(email, {
          researcherName,
          trackingIds: [tracking_id],
          comment: latestComment,
        });
      } else {
        const entry = emailMap.get(email);
        entry.trackingIds.push(tracking_id); // multiple IDs
      }

      // Update cart status once per cart
      const updateCartStatusQuery = `UPDATE cart SET order_status = 'Pending' WHERE id = ?`;
      mysqlConnection.query(updateCartStatusQuery, [cartId], (cartErr) => {
        if (cartErr) {
          console.error(`Failed to update cart status for cart ${cartId}:`, cartErr);
        }
      });
    }
  }

  // Send one email per unique user
  for (const [email, { researcherName, trackingIds, comment }] of emailMap.entries()) {
    const uniqueTrackingIds = [...new Set(trackingIds)];

    // Format tracking IDs as list items
    const trackingListHTML = uniqueTrackingIds.map(id => `<li>${id}</li>`).join("");
    const subject = `Committee Status Update`;
    const text = `
  <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      
      <p style="font-size: 16px; color: #333;">
        <b>Dear ${researcherName},</b>
      </p>

      <p style="font-size: 15px; color: #555; line-height: 1.6;">
        Your sample request(s) for the following Tracking ID(s) have been reviewed by 
        <b>${committeeType}</b> committee members:
      </p>

      <ul style="font-size: 15px; color: #555; background-color: #f4f6f8; padding: 10px; border-radius: 6px;">
        Tracking ID(s): ${trackingListHTML}
      </ul>

      <p style="font-size: 15px; color: #555; margin-top: 15px;">
        📝 <b>Latest Comment:</b> ${comment}
      </p>

      <p style="font-size: 15px; color: #555; margin-top: 20px;">
        Please check your <b>dashboard</b> for details. 🚀
      </p>

      <p style="font-size: 15px; color: #333; margin-top: 20px;">
        Regards,<br>
        <strong>Discovery Connect Team</strong>
      </p>

    </div>
  </div>
`;

    sendEmail(email, subject, text, (emailErr) => {
      if (emailErr) {
        console.error(`Failed to send email to ${email}:`, emailErr);
      } else {
        console.log(`✅ Email sent to ${email}`);
      }
    });
  }


  const finalMessage = hasError
    ? "Some updates failed. Check logs."
    : "Committee statuses updated and email(s) sent where applicable.";

  callback(null, { success: !hasError, message: finalMessage });
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