const debug = require('debug')('registrar:controller')
const utils = require('../utils/utils.js')
const http = require('axios')
const registrar = require('../models/registrar.js');

var env = process.env.NODE_ENV || 'development';
var config = require('../config')[env];

var fs = require('fs');
var path = require('path');

function readJsonFile(fileName) {
    var rawData = fs.readFileSync(path.join("./", "data", fileName));
    var json = JSON.parse(rawData);
    return json
}

var rawData = fs.readFileSync(path.join("./", "data", `reg_shorter.json`));
var shorter = JSON.parse(rawData);

function makeThing(type, version) {
    var thing = readJsonFile(`reg_${type}${version}_thing.json`)
    var location = readJsonFile(`reg_${type}${version}_location.json`)
    var observedProperty_temp = readJsonFile(`reg_${type}${version}_datastream_temp.json`)
    var observedProperty_rh = readJsonFile(`reg_${type}${version}_datastream_RH.json`)
    var observedProperty_pm10 = readJsonFile(`reg_${type}${version}_datastream_PM10.json`)
    var observedProperty_pm25 = readJsonFile(`reg_${type}${version}_datastream_PM25.json`)
    var observedProperty_no2 = readJsonFile(`reg_${type}${version}_datastream_NO2.json`)
    var observedProperty_geluid = readJsonFile(`reg_${type}${version}_datastream_Geluidsdruk.json`)
    var observedProperty_spanning = readJsonFile(`reg_${type}${version}_datastream_Spanning.json`)

    observedProperty_temp['ObservedProperty'] = { "@iot.id": 1 }
    observedProperty_rh['ObservedProperty'] = { "@iot.id": 2 }
    observedProperty_pm10['ObservedProperty'] = { "@iot.id": 3 }
    observedProperty_pm25['ObservedProperty'] = { "@iot.id": 4 }
    observedProperty_no2['ObservedProperty'] = { "@iot.id": 5 }
    observedProperty_geluid['ObservedProperty'] = { "@iot.id": 6 }
    observedProperty_spanning['ObservedProperty'] = { "@iot.id": 7 }

    observedProperty_temp['Sensor'] = { "@iot.id": 1 }
    observedProperty_rh['Sensor'] = { "@iot.id": 2 }
    observedProperty_pm10['Sensor'] = { "@iot.id": 3 }
    observedProperty_pm25['Sensor'] = { "@iot.id": 4 }
    observedProperty_no2['Sensor'] = { "@iot.id": 5 }
    observedProperty_geluid['Sensor'] = { "@iot.id": 6 }
    observedProperty_spanning['Sensor'] = { "@iot.id": 7 }

    thing.Locations.push(location)
    thing.Datastreams.push(observedProperty_temp)
    thing.Datastreams.push(observedProperty_rh)
    thing.Datastreams.push(observedProperty_pm10)
    thing.Datastreams.push(observedProperty_pm25)
    thing.Datastreams.push(observedProperty_no2)
    thing.Datastreams.push(observedProperty_geluid)
    thing.Datastreams.push(observedProperty_spanning)

    return thing
}

async function Register(req, res) {
    debug(`Register post`)
    const serviceUrl = utils.getServiceUrl(req)

    var type = /*req.body.type ??*/ 't'
    var version = /*req.body.version ??*/ '1'
    var serial = req.body.serial
    var id = 0

    // known serial?
    var records = await registrar.find(serial)
    if (0 == records.length) {
        var _thing = makeThing(type, version)

        //debug(JSON.stringify(_thing))

        await http
            .post(`${config.pitas.serviceUrl}/Things`, _thing)
            .then(r => {
                id = r.data['@iot.id']
            })
            .then(r => {
                registrar.insert(serial, id)
            })
            .catch(error => {
                debug(error)
            })
    } else {
        var record = records[0]
        id = record.id
    }

    await http
        .get(`${config.pitas.serviceUrl}/Things(${id})/Datastreams?$expand=ObservedProperty`)
        .then(r => {
            var response = {}
            response.time = new Date().toISOString()
            response.cnt = r.data.value.length
            response.ds = []

            var freq = config.frequency || 15
            var use = config.use || 1

            for (var ds of r.data.value) {
                var observedProperty = ds['ObservedProperty']
                var short = shorter[`${type}${version}`][observedProperty.name]
                var o = new Object();
                o[short] = `${ds["@iot.id"]},${freq},${use}`
                response.ds.push(o)
            }

            res.status(200).json(response)
        })
        .catch(error => {
            debug(error)
        })
}

async function Update(req, res) {
    debug(`Update post`)
    const serviceUrl = utils.getServiceUrl(req)

    var type = /*req.body.type ??*/ 't'
    var version = /*req.body.version ??*/ '1'
    var serial = req.body.serial
    var id = 0

    // known serial?
    var records = await registrar.find(serial)
    if (0 == records.length) {
        throw new Error('NOT FOUND')
    } else {
        var record = records[0]
        id = record.id
    }

    await http
        .get(`${config.pitas.serviceUrl}/Things(${id})/Datastreams?$expand=ObservedProperty`)
        .then(r => {
            var response = {}
            response.time = new Date().toISOString()
            response.cnt = r.data.value.length
            response.ds = []

            var freq = config.frequency || 15
            var use = config.use || 1

            for (var ds of r.data.value) {
                var observedProperty = ds['ObservedProperty']
                var short = shorter[`${type}${version}`][observedProperty.name]
                var o = new Object();
                o[short] = `${ds["@iot.id"]},${freq},${use}`
                response.ds.push(o)
            }

            res.status(200).json(response)
        })
        .catch(error => {
            debug(error)
        })
}

module.exports = {
    Register, Update
}