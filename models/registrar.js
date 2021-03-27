const debug = require('debug')('registrar:models')
var database = require('../database')

async function find(serial) {
  debug(`find`)

  var select = `SELECT * FROM register WHERE serial = '${serial}'`
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

async function insert(serial, id) {
  debug(`insert`)

  var sql = `INSERT INTO register (serial, id) VALUES (?,?)`
  var values = [serial, id]

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