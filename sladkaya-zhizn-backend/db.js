const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'pall_naA88*', 
    database: 'sladkaya_zhizn',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

const db = {
    execute: async (query, params = []) => {
        try {
            const [rows] = await promisePool.query(query, params);
            return [rows, rows.affectedRows];
        } catch (err) {
            console.error('DB Error:', err);
            throw err;
        }
    }
};

module.exports = db;