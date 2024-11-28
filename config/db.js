// require('dotenv').config();
// const mongoose = require('mongoose');
// const { secret } = require('./secret');

// mongoose.set('strictQuery', false);

// // it is local url 
// const DB_URL = 'mongodb://127.0.0.1:27017/hamart';
// // it is mongodb url
// const MONGO_URI = secret.db_url;

// const connectDB = async () => {
//   try { 
//     await mongoose.connect(MONGO_URI);
//     console.log('mongodb connection success!');
//   } catch (err) {
//     console.log('mongodb connection failed!', err.message);
//   }
// };
            
// module.exports = connectDB;





const mysql = require("mysql2");
// databse connection
var mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "discoveryconnect321",
    database: "discoveryconnect",
});


// check wether the connection is successfull or not !!
mysqlConnection.connect((err) => {
    if (err) {
        console.log(
            "Database Connection Error" + JSON.stringify(err, undefined, 2)
        );
    } else console.log("Connection Successful");
});
module.exports = mysqlConnection; 