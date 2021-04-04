const debug = require('debug')('registrar:models')
var database = require('../database')

async function find(service, serial) {
  debug(`find`)

  var select = `SELECT * FROM register WHERE service = '${service}' AND serial = '${serial}'`
  var sql = select
  try {
    var conn = await database.pool().getConnection()
    var records = await conn.query(sql)
    return records
  } catch (err) {
    debug(err)
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

async function insert(service, serial, id) {
  debug(`insert`)

  var sql = `INSERT INTO register (service, serial, id) VALUES (?,?,?)`
  var values = [service, serial, id]

  try {
    var conn = await database.pool().getConnection()
    var records = await conn.query(sql, values)
    return records.length
  } catch (err) {
    debug(err)
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

module.exports = {
  find, insert
}