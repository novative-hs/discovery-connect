const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
const createcommitteesampleapprovalTable = () => {
  const committeesampleapprovalableQuery = `
 CREATE TABLE IF NOT EXISTS committeesampleapproval (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,  
  sender_id INT NOT NULL,  -- Registration admin
  committee_member_id INT NOT NULL, 
  committee_status ENUM('Pending', 'Approved', 'Refused') NOT NULL DEFAULT 'Pending',
  comments TEXT NULL, 
  Approval_date TIMESTAMP,
  transfer INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
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
const insertCommitteeApproval = async (cartId, senderId, committeeType , callback) => {
  try {
    const connection = mysqlConnection.promise();
    const orderId = cartId; 

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

    // 2. Fetch max transfer ID for this order
    const [transferResults] = await connection.query(
      `SELECT COALESCE(MAX(transfer),0) AS maxTransferId 
       FROM committeesampleapproval 
       WHERE order_id = ?`,
      [orderId]
    );

    const maxTransferId = transferResults[0]?.maxTransferId || 0;
    const newTransferId = maxTransferId + 1;

    // 3. Prepare batch insert
    const insertValues = committeeMembers.map(member => [
      orderId,
      senderId,
      member.user_account_id,
      "Pending",
      newTransferId,
    ]);

    await connection.query(
      `INSERT INTO committeesampleapproval 
       (order_id, sender_id, committee_member_id, committee_status, transfer) VALUES ?`,
      [insertValues]
    );

    // 4. Update order status
    await connection.query(
      `UPDATE orders SET order_status = 'Pending' WHERE id = ?`,
      [orderId]
    );

    // 5. Fetch researcher email & tracking ID
    const [emailResults] = await connection.query(
      `SELECT ua.email, r.researcherName, o.tracking_id
       FROM user_account ua
       JOIN orders o ON ua.id = o.user_id
       JOIN researcher r ON ua.id = r.user_account_id
       WHERE o.id = ?`,
      [orderId]
    );

    // 6. Send email
    if (emailResults.length) {
      const { email, researcherName, tracking_id } = emailResults[0];
      setImmediate(async () => {
        try {
          await sendEmail(email, "Your Sample Submission is Under Review", `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
              <h2 style="color: #2c3e50;">Sample Request Under Review</h2>
              <p>Dear <strong>${researcherName}</strong>,</p>
              <p>Your sample request (Tracking ID: <strong>${tracking_id}</strong>) is now <strong>under review</strong> by the committee.</p>
              <p>You can log in to your dashboard for further updates.</p>
              <p style="margin-top: 30px;">Thank you for using <strong>Discovery Connect</strong>.</p>
              <p style="color: #7f8c8d;">Best regards,<br/>Discovery Connect Team</p>
            </div>
          `);
        } catch (err) {
          console.error(`Email failed for ${email}:`, err);
        }
      });
    }

    callback(null, { message: "Transfer to the Committee Member Successfully" });

  } catch (err) {
    console.error("Error:", err);
    callback(err, null);
  }
};



const updateCommitteeStatus = async (order_id, committee_member_id, committee_status, comments, callback) => {
  try {
    // 1. Get committee type
    const getCommitteeTypeQuery = `SELECT committeetype FROM committee_member WHERE user_account_id = ?`;
    const [committeeTypeResult] = await mysqlConnection.promise().query(getCommitteeTypeQuery, [committee_member_id]);
    const committeeType = committeeTypeResult[0]?.committeetype || "Committee";

    // 2. Update committee status for this order
    const updateQuery = `
      UPDATE committeesampleapproval 
      SET committee_status = ?, comments = ?, Approval_date = NOW()
      WHERE committee_member_id = ? AND order_id = ? AND committee_status = 'Pending'
    `;
    await mysqlConnection.promise().query(updateQuery, [committee_status, comments, committee_member_id, order_id]);

    // 3. Check if all members have submitted
    const [checkResult] = await mysqlConnection.promise().query(
      `SELECT COUNT(*) AS pending FROM committeesampleapproval WHERE order_id = ? AND committee_status IS NULL`,
      [order_id]
    );

    let sendEmailFlag = false;
    if (checkResult[0].pending === 0) {
      sendEmailFlag = true;
    }

    if (sendEmailFlag) {
      // 4. Fetch researcher email + info
      const getEmailQuery = `
        SELECT ua.email, r.ResearcherName, o.tracking_id 
        FROM user_account ua
        JOIN orders o ON ua.id = o.user_id 
        JOIN researcher r ON ua.id = r.user_account_id
        WHERE o.id = ?
      `;
      const [results] = await mysqlConnection.promise().query(getEmailQuery, [order_id]);

      if (results.length > 0) {
        const { email, ResearcherName, tracking_id } = results[0];

        // 5. Update order status
        await mysqlConnection.promise().query(
          `UPDATE orders SET order_status = 'Pending' WHERE id = ?`,
          [order_id]
        );

        // 6. Send email
        const subject = `Committee Status Update`;
        const html = `
          <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p><b>Dear ${ResearcherName},</b></p>
              <p>Your sample request with <b>Tracking ID: ${tracking_id}</b> has been reviewed by 
              <b>${committeeType}</b> committee members.</p>
              <p><b>Status:</b> ${committee_status}</p>
              <p><b>Comment:</b> ${comments || "No comments provided."}</p>
              <p>Please check your dashboard for details.</p>
              <p>Regards,<br><strong>Discovery Connect Team</strong></p>
            </div>
          </div>
        `;

        sendEmail(email, subject, html, (err) => {
          if (err) {
            console.error(`❌ Failed to send email to ${email}:`, err);
          } else {
            console.log(`✅ Email sent to ${email}`);
          }
        });
      }
    }

    callback(null, { success: true, message: "Committee status updated successfully." });
  } catch (err) {
    console.error("Error updating committee status:", err);
    callback(err, { success: false, message: "Error updating committee status." });
  }
};


const getAllOrderByCommittee = async (id, page, pageSize, searchField, searchValue, callback) => {
  try {
    const offset = (page - 1) * pageSize;
    const connection = mysqlConnection.promise();

    let whereClause = `WHERE 1=1`; 
    const params = [id]; // committee_member_id

    if (searchField && searchValue) {
      let dbField;
      switch (searchField) {
        case "created_at": dbField = "o.created_at"; break;
        case "tracking_id": dbField = "o.tracking_id"; break;
        case "researcher_name": dbField = "r.ResearcherName"; break;
        case "user_email": dbField = "u.email"; break;
        case "organization_name": dbField = "org.OrganizationName"; break;
      }
      if (dbField) {
        whereClause += ` AND ${dbField} LIKE ?`;
        params.push(`%${searchValue}%`);
      }
    }

    const [rows] = await connection.query(`
      SELECT *,
             COUNT(*) OVER() AS totalCount
      FROM (
        SELECT 
          o.id AS order_id, 
          o.tracking_id,
          o.user_id, 
          u.email AS user_email,
          r.ResearcherName AS researcher_name, 
          org.OrganizationName AS organization_name,
          s.id AS sample_id,
          s.Analyte, 
          s.VolumeUnit,
          s.age,
          s.gender,
          s.TestResult,
          s.TestResultUnit,
          s.volume,
          s.room_number,
          s.freezer_id,
          s.box_id,
          c.price, 
          c.quantity, 
          o.totalpayment, 
          o.order_status,  
          o.created_at,
          ca.committee_status,  
          ca.comments
        FROM orders o
        JOIN cart c ON o.id = c.order_id              -- 🔑 link cart to order
        JOIN user_account u ON o.user_id = u.id
        LEFT JOIN researcher r ON u.id = r.user_account_id 
        LEFT JOIN organization org ON r.nameofOrganization = org.id
        JOIN sample s ON c.sample_id = s.id           -- 🔑 sample belongs to cart
        LEFT JOIN committeesampleapproval ca
          ON ca.order_id = o.id AND ca.committee_member_id = ?
        ${whereClause}
        ORDER BY o.created_at ASC
        LIMIT ? OFFSET ?
      ) AS sub;
    `, [...params, pageSize, offset]);

    const totalCount = rows.length ? rows[0].totalCount : 0;

    const results = rows.map(sample => ({
      ...sample,
      committee_status: sample.committee_status || "Pending",
      locationids: [sample.room_number, sample.freezer_id, sample.box_id].filter(Boolean).join('-')
    }));

    callback(null, { results, totalCount });
  } catch (err) {
    console.error("Error fetching orders:", err);
    callback(err, null);
  }
};

const getAllDocuments = (page, pageSize, searchField, searchValue, id, callback) => {
  const offset = (page - 1) * pageSize;

  let whereClause = "WHERE 1=1";
  const params = [];

  // Filter by search field
  if (searchField && searchValue) {
    let dbField = searchField;
    if (searchField === "order_id") dbField = "o.id";  // changed cart_id → order_id
    whereClause += ` AND ${dbField} LIKE ?`;
    params.push(`%${searchValue}%`);
  }

  // Filter by committee member ID
  if (id) {
    whereClause += " AND csa.committee_member_id = ?";
    params.push(id);
  }

  // Optimized SQL using CTE + ROW_NUMBER()
  const sqlQuery = `
    WITH latest_docs AS (
      SELECT
        sd.order_id,
        sd.study_copy,
        sd.irb_file,
        sd.nbc_file,
        sd.reporting_mechanism,
        ROW_NUMBER() OVER (
          PARTITION BY sd.order_id
          ORDER BY COALESCE(sd.updated_at, sd.created_at) DESC
        ) AS rn
      FROM sampledocuments sd
    )
    SELECT 
      o.id AS order_id,
      ld.study_copy,
      ld.irb_file,
      ld.nbc_file,
      ld.reporting_mechanism
    FROM orders o
    JOIN committeesampleapproval csa ON o.id = csa.order_id
    LEFT JOIN latest_docs ld ON o.id = ld.order_id AND ld.rn = 1
    ${whereClause}
    ORDER BY o.created_at ASC
    LIMIT ? OFFSET ?;
  `;

  const queryParams = [...params, pageSize, offset];

  mysqlConnection.query(sqlQuery, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching documents:", err);
      callback(err, null);
    } else {
      callback(null, { results });
    }
  });
};


module.exports = {
  createcommitteesampleapprovalTable,
  insertCommitteeApproval,
  updateCommitteeStatus,
  getAllOrderByCommittee,
  getAllDocuments,

};