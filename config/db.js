require("dotenv").config();
const mysql = require("mysql2");

const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10, // Optional: Adjust based on your expected traffic
//    acquireTimeout: 30000, // Time in ms before a connection attempt is considered timed out
//    connectTimeout: 10000, // Time in ms before a connection attempt is considered timed out
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
