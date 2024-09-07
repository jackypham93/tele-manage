const { Pool } = require('pg');
require('dotenv').config()
const { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT, DB_SSL } = process.env
// Create a new pool instance with PostgreSQL connection details
const pool = new Pool({
    user: DB_USER,  
    host: DB_HOST,     
    database: DB_NAME,     
    password: DB_PASS, 
    port: DB_PORT,
    ssl: DB_SSL               
});

module.exports = pool;
