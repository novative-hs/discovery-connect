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
  Approval_date TIMESTAMP,
  transfer INT,
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
const insertCommitteeApproval = async (cartIds, senderId, committeeType, callback) => {
  try {
    if (!Array.isArray(cartIds) || cartIds.length === 0) {
      return callback(new Error("No cart IDs provided"), null);
    }

    const connection = mysqlConnection.promise();

    // 1. Fetch committee members (only active ones)
    let memberQuery = "";
    if (committeeType === "scientific") {
      memberQuery = "SELECT user_account_id, committeetype FROM committee_member WHERE committeetype = 'Scientific' AND status != 'inactive'";
    } else if (committeeType === "ethical") {
      memberQuery = "SELECT user_account_id, committeetype FROM committee_member WHERE committeetype = 'Ethical' AND status != 'inactive'";
    } else if (committeeType === "both") {
      memberQuery = "SELECT user_account_id, committeetype FROM committee_member WHERE committeetype IN ('Scientific', 'Ethical') AND status != 'inactive'";
    } else {
      return callback(new Error("Invalid committee type"), null);
    }

    const [committeeMembers] = await connection.query(memberQuery);
    if (!committeeMembers.length) {
      return callback(null, { message: "No active committee members found." });
    }

    // 2. Fetch max transfer IDs for all carts in one go
    const [transferResults] = await connection.query(
      `SELECT cart_id, COALESCE(MAX(transfer),0) AS maxTransferId 
       FROM committeesampleapproval 
       WHERE cart_id IN (?) 
       GROUP BY cart_id`,
      [cartIds]
    );

    const transferMap = {};
    transferResults.forEach(row => {
      transferMap[row.cart_id] = row.maxTransferId;
    });

    // 3. Prepare batch insert
    const insertValues = [];
    cartIds.forEach(cartId => {
      const newTransferId = (transferMap[cartId] || 0) + 1;
      committeeMembers.forEach(member => {
        insertValues.push([cartId, senderId, member.user_account_id, "Pending", newTransferId]);
      });
    });

    await connection.query(
      `INSERT INTO committeesampleapproval 
       (cart_id, sender_id, committee_member_id, committee_status, transfer) VALUES ?`,
      [insertValues]
    );

    // 4. Update cart status in one query
    await connection.query(
      `UPDATE cart SET order_status = 'Pending' WHERE id IN (?)`,
      [cartIds]
    );

    // 5. Fetch researcher emails & tracking IDs
    const [emailResults] = await connection.query(
      `SELECT DISTINCT ua.email, r.researcherName, c.tracking_id
       FROM user_account ua
       JOIN cart c ON ua.id = c.user_id
       JOIN researcher r ON ua.id = r.user_account_id
       WHERE c.id IN (?)`,
      [cartIds]
    );

    // 6. Send emails asynchronously (doesn't block response)
    const emailMap = {};
    emailResults.forEach(({ email, researcherName, tracking_id }) => {
      if (!emailMap[email]) emailMap[email] = { researcherName, trackingIds: [] };
      emailMap[email].trackingIds.push(tracking_id);
    });

    Object.entries(emailMap).forEach(([email, { researcherName, trackingIds }]) => {
      setImmediate(async () => {
        try {
          await sendEmail(email, "Your Sample Submission is Under Review", `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2c3e50;">Sample Request Under Review</h2>
              <p>Dear <strong>${researcherName}</strong>,</p>
              <p>The following sample request(s) you submitted are now <strong>under review</strong> by the committee:</p>
              <ul style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
                Tracking ID(s): ${trackingIds.join(", ")}
              </ul>
              <p>You can log in to your dashboard for further updates.</p>
              <p style="margin-top: 30px;">Thank you for using <strong>Discovery Connect</strong>.</p>
              <p style="color: #7f8c8d;">Best regards,<br/>Discovery Connect Team</p>
            </div>
          `);
        } catch (err) {
          console.error(`Email failed for ${email}:`, err);
        }
      });
    });

    callback(null, { message: "Transfer to the Committee Member Successfully" });

  } catch (err) {
    console.error("Error:", err);
    callback(err, null);
  }
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
      WHERE committee_member_id = ? AND cart_id = ? AND committee_status='Pending'`;

    await new Promise((resolve) => {
      mysqlConnection.query(updateQuery, [committee_status, comments, committee_member_id, cartid], async (err) => {
        if (err) {
          console.error(`Error updating committee status for cart ${cartid}:`, err);
          hasError = true;
          return resolve();
        }

        // if (committee_status === 'Refused') {
        //   try {
        //     revertSampleQuantity(cartid);
        //   } catch (revertErr) {
        //     console.error(`❌ Error reverting quantity for cart ${cartid}:`, revertErr);
        //   }
        // }

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

const getHistory = (tracking_ids, status, callback) => {
  try {
    const placeholders = tracking_ids.map(() => '?').join(',');

    const orderStatusCondition = status === 'Pending'
      ? 'c.order_status = ?'
      : "c.order_status != 'Pending'";
    const sql = `
      SELECT 
        c.id AS cart_id,
        c.tracking_id,
        csa.transfer,
        tas.created_at AS Technicaladmindate,
        tas.Approval_date AS TechnicaladminApproval_date,
        csa.committee_status,
        csa.comments AS committee_comment,
        cm.CommitteeMemberName,
        cm.committeetype,
        csa.Approval_date AS committee_approval_date,
        csa.created_at AS committee_created_at
      FROM cart c
      LEFT JOIN technicaladminsampleapproval tas ON tas.cart_id = c.id
      LEFT JOIN committeesampleapproval csa ON csa.cart_id = c.id
      LEFT JOIN committee_member cm ON cm.user_account_id = csa.committee_member_id
      WHERE c.tracking_id IN (${placeholders})
           AND ${orderStatusCondition}
      ORDER BY c.id, csa.transfer, csa.created_at
    `;

    mysqlConnection.query(sql, [...tracking_ids, status], (err, historyResults) => {
      if (err) return callback(err, null);

      // After fetching history, fetch documents separately
      getDocumentsByTrackingIds(tracking_ids, (docErr, documentResults) => {
        if (docErr) return callback(docErr, null);

        // Merge documents into history results
        const mergedResults = historyResults.map(item => ({
          ...item,
          documents: documentResults.filter(doc => doc.cart_id === item.cart_id)
        }));

        callback(null, mergedResults);
      });
    });

  } catch (err) {
    console.error("Error fetching history:", err);
    callback(err, null);
  }
};

const getDocumentsByTrackingIds = (tracking_ids, callback) => {
  try {
    const placeholders = tracking_ids.map(() => '?').join(',');

    const sql = `
      SELECT 
        MIN(sd.cart_id) AS cart_id,        -- pick one cart_id
        c.tracking_id,
        sd.added_by,
        sd.role AS uploaded_by_role,
        MAX(sd.study_copy) AS study_copy,
        MAX(sd.irb_file) AS irb_file,
        MAX(sd.nbc_file) AS nbc_file,
        MIN(sd.created_at) AS created_at,
        MAX(sd.updated_at) AS updated_at
      FROM sampledocuments sd
      JOIN cart c ON c.id = sd.cart_id
      WHERE c.tracking_id IN (${placeholders})
      GROUP BY c.tracking_id, sd.added_by, sd.role
      ORDER BY created_at;
    `;

    mysqlConnection.query(sql, tracking_ids, callback);
  } catch (err) {
    console.error("Error fetching documents:", err);
    callback(err, null);
  }
};




module.exports = {
  createcommitteesampleapprovalTable,
  insertCommitteeApproval,
  updateCommitteeStatus,
  getHistory
};