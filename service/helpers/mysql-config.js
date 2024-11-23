const mysql = require('mysql2/promise')
require('dotenv').config()
const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    port: process.env.DBPORT,
    database: process.env.DBNAME,
    connectionLimit: 10
})

module.exports = pool