require("dotenv").config();
const mysql = require("mysql2");

const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10, // Adjust based on your expected traffic
    connectTimeout: 10000, // Time in ms before a connection attempt times out
    waitForConnections: true, // Helps prevent connection errors under load
    queueLimit: 0, // Unlimited queueing
});

mysqlPool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database Connection Error", err);
    } else {
        console.log("✅ Connection Successful to MySQL");
        connection.release(); // Release connection back to pool
    }
});

module.exports = mysqlPool;
