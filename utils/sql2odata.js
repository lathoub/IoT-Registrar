const debug = require('debug')('registrar:controller')
const schema = require('../database/stapiSchema.js');
const _odata = require('../utils/odata.js');
const utils = require('../utils/utils.js');

function isEntitySet(resourcePath) {
    if (resourcePath.type == _odata.resourcePathTypes.ENTITYSET)
        return (undefined == resourcePath.id)
    return false
}

function makeRecord(servicelUrl, schema, record, $value) {
    var selfLink = `${servicelUrl}/${schema.set}(${record.id})`

    var retVal = {}

    if (record.id) {
        retVal['@iot.id'] = record.id
        retVal['@iot.selflink'] = selfLink
    }

    for (var column of schema.columns)
        if (typeof (record[column]) !== 'undefined')
            retVal[column] = record[column]

    // navigationLinks
    if (record.id)
        for (var link of schema.relationship.navigation)
            retVal[`${link}@iot.navigationLink`] = `${selfLink}/${link}`

    return retVal
}

function makeDataArray(serviceUrl, resourcePath, sqlResult, count) {

    const s = schema.getSchema(resourcePath.name)

    var retVal = {}

    if (count)
        retVal['dataArray@iot.count'] = sqlResult.length
    if (true) // TODO
        retVal['@iot.nextlink'] = `${serviceUrl}`

    // navigationLinks
    for (var link of s.relationship.navigation)
        retVal[`${link}@iot.navigationLink`] = `${serviceUrl}/${link}`

    retVal.components = Array.from(s.columns)
    retVal.components.splice(0, 0, '@iot.id'); // add '@iot.id' at the start

    retVal.dataArray = []
    for (var record of sqlResult) {
        var item = [record['id']]
        for (var column of s.columns)
            item.push(record[column])
        retVal.dataArray.push(item)
    }

    return retVal
}

function makeRecords(serviceUrl, resourcePath, sqlResult, count) {
    var retVal = {}

    if (count)
        retVal['@iot.count'] = sqlResult.length
    if (true) // TODO
        retVal['@iot.nextlink'] = `${serviceUrl}`


    const s = schema.getSchema(resourcePath.name)

    retVal.value = []
    for (var record of sqlResult)
        retVal.value.push(makeRecord(serviceUrl, s, record))

    return retVal
}

function evaluate(req, sqlResult, dataArray) {
    var odata = req.odata
    const serviceUrl = utils.getServiceUrl(req)

    if (!req.query.$count)
        req.query.$count = true
    if (!req.query.$resultFormat)
        req.query.$resultFormat = 'records'

    if ('$value' == odata.propertyValue)
        return sqlResult[0][odata.property]

    var mainResourcePath = odata.resourcePath[odata.resourcePath.length - 1]
    if (isEntitySet(mainResourcePath))
        if ('dataArray' == req.query.$resultFormat)
            return makeDataArray(serviceUrl, mainResourcePath, sqlResult, req.query.$count)
        else
            return makeRecords(serviceUrl, mainResourcePath, sqlResult, req.query.$count)
    else
        return makeRecord(serviceUrl, schema.getSchema(mainResourcePath.name), sqlResult[0])
}

module.exports = {
    evaluate
}
