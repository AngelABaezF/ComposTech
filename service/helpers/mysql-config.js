const mysql = require('mysql2/promise')
require('dotenv').config()
const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    port: process.env.DBPORT,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

/*const localConfig = {
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    database: "compostech",
    debug: false,
    port: 3306,
  };*/

module.exports = pool

/*const connection = mysql.createPool(localConfig);

connection.getConnection((err, connec) => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  } else {
    console.log("Connection established");
    connec.release();
  }
});

module.exports = connection;*/