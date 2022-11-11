const mysql = require('mysql');
const config = require("./config.json");

let conn;

function connectDatabase() {
    if (!conn) {
        conn = mysql.createConnection(config.sql);
        conn.connect(err => {
            if(!err) {
                console.log('Database is connected!');
            } else {
                console.log('Error connecting database!');
            }
        })

        conn.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'ECONNRESET') {
                conn = null
                connectDatabase()
            } else {
                throw err;
            }
        });
    }
    return conn;
}

module.exports = connectDatabase()