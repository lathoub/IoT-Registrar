const mariadb = require('mariadb'); // use Promise API
const debug = require('debug')('pitas:database')

var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];

const _pool = mariadb.createPool({
    host: config.mariadb.host,
    user: config.mariadb.user,
    password: process.env.DB_password, // preloaded
    database: config.mariadb.database,
    port: config.mariadb.port,
    connectionLimit: 5
})

async function connect() {
    await _pool.getConnection()
        .then(conn => {
            _db = conn
            debug("connected to MariaDB, connection id is " + _db.threadId);
        })
        .catch(err => {
            debug("not connected due to error: " + err);
        });
}

function pool() {
    return _pool
}

module.exports = {
    connect, pool
}
