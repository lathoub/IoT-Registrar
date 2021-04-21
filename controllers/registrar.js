const debug = require('debug')('registrar:controller')
const http = require('axios')
const registrar = require('../models/registrar.js');

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var fs = require('fs');
var path = require('path');

async function Register(req, res) {
    var type = /*req.body.type ??*/ 't'
    var version = /*req.body.version ??*/ '1'
    var serial = req.body.serial
    var id = 0

    if (!serial)
        return res.status(500).json()

    debug(`Registration from device with serial: ${serial}`)

    var rawData = fs.readFileSync(path.join(__dirname, '../config', `/${config.service}`, `thing.json`));
    var _thing = JSON.parse(rawData);

    var serviceUrl = config.pitas.protocol + config.pitas.host + ':' + config.pitas.port + '/' + config.pitas.resource

    // known serial?
    var records = await registrar.find(config.service, serial)
    if (0 == records.length) {

        debug(`Unknown device ${serial}, sending configuration (${_thing['Datastreams'].length} Datastreams) to ${serviceUrl}`)

        await http
            .post(`${serviceUrl}/Things`, _thing)
            .then(r => {
                id = r.data['@iot.id']
                debug(`Unknown device ${serial}, has been assigned Thing@iot.id ${id} `)
            })
            .then(r => {
                registrar.insert(config.service, serial, id)
            })
            .catch(error => {
                debug(error)
            })
    } else {
        var record = records[0]
        id = record.id
        debug(`Known device ${serial} with Thing@iot.id ${id} registered`)
    }

    debug(serviceUrl)

    await http
        .get(`${serviceUrl}/Things(${id})/Datastreams?$expand=ObservedProperty`)
        .then(r => {
            debug(`Creating response for Thing@iot.id ${id}`)
            var response = require(`../config/${config.service}/returnObject.js`).getReturnObject(r, config);
            res.status(200).json(response)
        })
        .catch(error => {
            debug(error)
        })
}

async function Update(req, res) {
}

module.exports = {
    Register, Update
}