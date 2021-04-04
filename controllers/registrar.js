const debug = require('debug')('registrar:controller')
const http = require('axios')
const registrar = require('../models/registrar.js');

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var fs = require('fs');
var path = require('path');

async function Register(req, res) {
    debug(`Register post`)

    var type = /*req.body.type ??*/ 't'
    var version = /*req.body.version ??*/ '1'
    var serial = req.body.serial
    var id = 0

    var rawData = fs.readFileSync(path.join('./config', `/${config.service}`, `thing.json`));
    var _thing = JSON.parse(rawData);

    var serviceUrl = config.pitas.protocol + config.pitas.host + ':' + config.pitas.port + '/' + config.pitas.resource

    // known serial?
    var records = await registrar.find(config.service, serial)
    if (0 == records.length) {
        await http
            .post(`${serviceUrl}/Things`, _thing)
            .then(r => {
                id = r.data['@iot.id']
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
    }

    await http
        .get(`${serviceUrl}/Things(${id})/Datastreams?$expand=ObservedProperty`)
        .then(r => {
            var response = {}
            response.time = new Date().toISOString()
            response.cnt = r.data.value.length
            response.ds = []

            var freq = config.frequency || 15
            var use = config.use || 1

            for (var ds of r.data.value) {
                var observedProperty = ds['ObservedProperty']
                var o = new Object();
                o[observedProperty.name] = `${ds["@iot.id"]},${freq},${use}`
                response.ds.push(o)
            }

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