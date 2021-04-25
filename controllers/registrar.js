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
    }

    if (!thing['@iot.id'])
        await http
            .post(`${serviceUrl}/Things`, thing)
            .then(r => {
                if (201 != r.status) 
                    return res.status(500).r
            })
            .catch(error => {
                return res.status(500).error
            })

    if (!thing['@iot.id'])
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
            var response = require(`../config/${config.service}/support.js`).getReturnObject(r, config);
            res.status(200).json(response)
        })
        .catch(error => {
            return res.status(500).error
        })
}

async function Update(req, res) {
}

module.exports = {
    Register, Update
}