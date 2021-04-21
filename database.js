const mariadb = require('mariadb'); // use Promise API
const debug = require('debug')('registrar:database')

var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];

const _pool = mariadb.createPool({
    host: config.mariadb.host,
    user: config.mariadb.user,
    password: process.env.DB_password,
    database: config.mariadb.database,
    port: config.mariadb.port,
    connectionLimit: 5
})

async function connect() {
    await _pool.getConnection()
        .then(conn => {
            _db = conn
            debug(`connected to MariaDB database instance with name ${config.mariadb.database}, connection id is ${_db.threadId}`);
        })
        .catch(err => {
            debug(`not connected due to error: ${err}`);
        });
}

function pool() {
    return _pool
}

module.exports = {
    connect, pool
}
