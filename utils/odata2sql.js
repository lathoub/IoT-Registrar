const utils = require('./utils.js')
const _schema = require('../database/stapiSchema.js');
const _odata = require('../utils/odata.js');

function prepareSql(odata) {
    var sql = {}
    sql.tables = []
    sql.where = []
    sql.columns = []
    sql.singular = false

    if (odata.property)
        sql.columns.push(odata.property)

    var resourcePaths = odata.resourcePath.slice()

    const resourcePath = utils.last(resourcePaths)
    const schema = _schema.getSchema(resourcePath.name)

    sql.tables.push(`${schema.tableName}`)

    if (resourcePath.id)
        sql.where.push(`${schema.tableName}.id = ${resourcePath.id}`)

    if (resourcePath.type == _odata.resourcePathTypes.ENTITY)
        sql.singular = true // singular entity, return only 1

    while (resourcePaths.length >= 2) {
        const rp1 = utils.last(resourcePaths)
        const rp2 = utils.beforeLast(resourcePaths)

        const s1 = _schema.getSchema(rp1.name)
        const s2 = _schema.getSchema(rp2.name)

        if (rp1.id)
            sql.where.push(`${s1.tableName}.id = ${rp1.id}`)
        if (rp2.id)
            sql.where.push(`${s2.tableName}.id = ${rp2.id}`)

        if (s1.relationship['foreignKeys'].includes(s2.tableName + '_id'))
            sql.where.push(`${s1.tableName}.${s2.tableName}_id = ${s2.tableName}.${'id'}`)
        else if (s2.relationship['foreignKeys'].includes(s1.tableName + '_id'))
            sql.where.push(`${s2.tableName}.${s1.tableName}_id = ${s1.tableName}.${'id'}`)
        else {
            var found = false
            for (var m2m of s1.relationship['manyToMany']) {
                if (m2m[s2.name]) {
                    const schema = _schema.getSchema(m2m[s2.name])
                    sql.tables.push(`${schema.tableName}`)

                    sql.where.push(`${schema.tableName}.${s1.tableName}_id = ${s1.tableName}.${'id'}`)
                    sql.where.push(`${schema.tableName}.${s2.tableName}_id = ${s2.tableName}.${'id'}`)

                    found = true
                    break
                }
            }

            if (!found)
                throw new Error('NOT FOUND')
        }

        sql.tables.push(`${s2.tableName}`)

        resourcePaths.pop() // remove last
    }

    return sql
}

module.exports = {
    prepareSql
}
