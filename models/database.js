const mysql = require('mysql2');
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'maymun_cicegi_kds'
}).promise();
module.exports = db;
