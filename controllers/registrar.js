const debug = require('debug')('registrar:controller')
const http = require('axios')

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

async function Register(req, res) {
    var type = /*req.body.type ??*/ 't'
    var version = /*req.body.version ??*/ '1'
    var serial = req.body.serial
    var id = 0

    if (!serial)
        return res.status(500).json()

    debug(`Registration from device with serial: ${serial}`)

    var serviceUrl = config.pitas.protocol + config.pitas.host + ':' + config.pitas.port + '/' + config.pitas.resource

    var thing = ''
    await http
        .get(`${serviceUrl}/Things?$filter=name eq '${serial}'`)
        .then(r => {
            debug(r.data.value)
            if (r.data.value.length > 0)
                thing = r.data.value[0]
        })
        .catch(error => {
            return res.status(500).error
        })

    if (!thing['@iot.id']) {
        var setup = require(`../config/${config.service}/support.js`)
        thing = await setup.createThing(serviceUrl, serial);

        await http
            .post(`${serviceUrl}/Things`, thing)
            .then(r => {
                if (201 != r.status)
                    return res.status(500).r
                var location = r.headers['location']
                var id = location.substring(location.lastIndexOf("(") + 1, location.lastIndexOf(")"));
                thing['@iot.id'] = id
            })
            .catch(error => {
                return res.status(500).error
            })
    }

    var response = {}
    response['stapi'] = config.pitas.protocol + config.pitas.host + ':' + config.pitas.port + '/' + config.pitas.resource
//    response['config'] = `https://registrar.snuffeldb.synology.me/Thing(${thing['@iot.id']})`
    response.time = new Date().toISOString()
    response.sendFrequency = 12

    await http
        .get(`${serviceUrl}/Things(${thing['@iot.id']})/Datastreams?$expand=ObservedProperty`)
        .then(r => {
            debug(`Sending response for Thing@iot.id ${thing['@iot.id']}`)
            require(`../config/${config.service}/support.js`).getReturnObject(response, r, config);
        })
        .catch(error => {
            return res.status(500).error
        })

    res.status(200).json(response)
}

async function Thing(req, res) {
    debug(`Updating from device with serial: ${req.query}`)

    var serviceUrl = config.pitas.protocol + config.pitas.host + ':' + config.pitas.port + '/' + config.pitas.resource

    var response = {}
    response.time = new Date().toISOString()
    response.sendFrequency = 12

    var thing = ''
    await http
        .get(`${serviceUrl}/Things?$filter=name eq '${serial}'`)
        .then(r => {
            debug(r.data.value)
            if (r.data.value.length > 0)
                thing = r.data.value[0]
        })
        .catch(error => {
            return res.status(500).error
        })

    await http
        .get(`${serviceUrl}/Things(${thing['@iot.id']})/Datastreams?$expand=ObservedProperty`)
        .then(r => {
            debug(`Sending response for Thing@iot.id ${thing['@iot.id']}`)
            require(`../config/${config.service}/support.js`).getReturnObject(response, r, config);
        })
        .catch(error => {
            return res.status(500).error
        })

    res.status(200).json(response)
}

module.exports = {
    Register, Thing
}