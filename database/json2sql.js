const debug = require('debug')('pitas:json2sql')
var database = require('../database')

async function json2insert(schema, obj) {
    var columns = []
    var values = []
    var qm = []

    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (schema.columns.includes(prop) ||
                schema.relationship['foreignKeys'].includes(prop)) {
                columns.push(prop)
                values.push(obj[prop])
                qm.push('?')
            }
        }
    }

    var sql = `INSERT INTO ${schema.tableName} (${columns.join()}) VALUES (${qm.join()})`

    try {
        var conn = await database.pool().getConnection()
        const result = await conn.query(sql, values)

        debug(`Created ${schema.tableName} with id: ${result.insertId}`)

        obj.id = result.insertId
    }
    catch (err) {
        debug(err)
        throw err;
    }
    finally {
        if (conn) conn.end();
    }
}

module.exports = {
    json2insert
}