const mysqlConnection = require("../config/db");
const { sendEmail } = require("../config/email");
// Function to fetch all organizations
const getAllOrderpackager = (callback) => {
  const query = "SELECT o.*, user_account.email AS email FROM orderpackager o JOIN user_account ON o.user_account_id = user_account.id ORDER BY OrderpackagerName ASC";
  mysqlConnection.query(query, (err, results) => {
    callback(err, results);
  });
};
const deleteOrderpackager=(id,callback)=>{
    const query = 'UPDATE orderpackager SET status = ? WHERE id = ?';
    mysqlConnection.query(query, ['unapproved', id], (err, result) => {
      callback(err, result);
    });
}

const updateOrderpackagerStatus = async (id, status) => {
    const updateQuery = "UPDATE orderpackager SET status = ? WHERE id = ?";
    const insertHistoryQuery = `
      INSERT INTO registrationadmin_history (orderpackager_id, status, updated_at)
      VALUES (?, ?, NOW())
    `;
    const getEmailQuery = `
      SELECT ua.email 
      FROM orderpackager o
      JOIN user_account ua ON o.user_account_id = ua.id
      WHERE o.id = ?
    `;
  
    const conn = await mysqlConnection.promise().getConnection();
  
    try {
      // Start transaction
      await conn.beginTransaction();
  
      const [updateResult] = await conn.query(updateQuery, [status, id]);
      if (updateResult.affectedRows === 0) {
        throw new Error("No order packager found with the given ID.");
      }
  
      const [insertResult] = await conn.query(insertHistoryQuery, [id, status]);
      const [emailResults] = await conn.query(getEmailQuery, [id]);
  
      if (emailResults.length === 0) {
        throw new Error("orderpackager email not found.");
      }
  
      await conn.commit();
      conn.release(); // Release the connection
  
      const email = emailResults[0].email;
  
      let emailText = `Dear Order packager,\n\nYour account status is currently pending. 
        Please wait for approval.\n\nBest regards,\nLab Hazir`;
  
      if (status === "approved") {
        emailText = `Dear Order packager,\n\nYour account has been approved! 
          You can now log in and access your account.\n\nBest regards,\nLab Hazir`;
      }
  
      sendEmail(email, "Welcome to Discovery Connect", emailText)
        .then(() => console.log("Email sent successfully"))
        .catch((emailErr) => console.error("Error sending email:", emailErr));
  
      return { message: "Status updated and email sent" };
    } catch (error) {
      await conn.rollback();
      conn.release();
      console.error("Error updating researcher status:", error);
      throw error;
    }
  };
module.exports = {
    getAllOrderpackager,
    deleteOrderpackager,
    updateOrderpackagerStatus
}