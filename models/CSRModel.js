const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
// Function to fetch all CSR
const getAllCSR = (callback) => {
  const query = `SELECT c.*, user_account.id AS user_account_id, 
      user_account.email AS useraccount_email, 
      user_account.password AS useraccount_password, city.name AS city,
      city.id AS cityid,
      district.name AS district,
      district.id AS districtid,
      country.name AS country,
      country.id AS countryid FROM CSR c 
      JOIN user_account ON c.user_account_id = user_account.id
       LEFT JOIN city ON c.city = city.id
    LEFT JOIN district ON c.district = district.id
    LEFT JOIN country ON c.country = country.id
      ORDER BY c.id DESC`;
  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};
const deleteCSR=(id,status,callback)=>{
    const query = 'UPDATE CSR SET status = ? WHERE id = ?';
    mysqlConnection.query(query, [status, id], (err, result) => {
      callback(err, result);
    });
}

const updateCSRStatus = async (id, status) => {
    const updateQuery = "UPDATE CSR SET status = ? WHERE id = ?";
    const insertHistoryQuery = `
      INSERT INTO min_history (csr_id, status, updated_at)
      VALUES (?, ?, NOW())
    `;
    const getEmailQuery = `
      SELECT ua.email 
      FROM CSR c
      JOIN user_account ua ON c.user_account_id = ua.id
      WHERE c.id = ?
    `;
  
    const conn = await mysqlConnection.promise().getConnection();
  
    try {
      // Start transaction
      await conn.beginTransaction();
  
      const [updateResult] = await conn.query(updateQuery, [status, id]);
      if (updateResult.affectedRows === 0) {
        throw new Error("No CSR found with the given ID.");
      }
  
      const [insertResult] = await conn.query(insertHistoryQuery, [id, status]);
      const [emailResults] = await conn.query(getEmailQuery, [id]);
  
      if (emailResults.length === 0) {
        throw new Error("CSR email not found.");
      }
  
      await conn.commit();
      conn.release(); // Release the connection
  
      const email = emailResults[0].email;
  
      let emailText = `Dear CSR,\n\nYour account status is currently <b>pending</b>. 
        Please wait for approval.\n\nBest regards,\nDiscovery Connect`;
  
      if (status === "approved") {
        emailText = `Dear CSR,\n\nYour account has been <b>approved</b>! 
          You can now log in and access your account.\n\nBest regards,\nDiscovery Connect`;
      }
  
      sendEmail(email, "Welcome to Discovery Connect", emailText)
        .then(() => console.log("Email sent successfully"))
        .catch((emailErr) => console.error("Error sending email:", emailErr));
  
      return { message: "Status updated and email sent" };
    } catch (error) {
      await conn.rollback();
      conn.release();
      console.error("Error updating CSR status:", error);
      throw error;
    }
  };
module.exports = {
    getAllCSR,
    deleteCSR,
    updateCSRStatus
}