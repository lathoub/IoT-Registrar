const debug = require('debug')('registrar:tracker')
const http = require('axios')
const fs = require('fs');
const path = require('path');

function readObject(fileName) {
    var rawData = fs.readFileSync(path.join(__dirname, fileName));
    return JSON.parse(rawData);
}

async function createThing(serviceUrl, serial) {
    var sensor = readObject('sensor.json')
    await http
        .get(`${serviceUrl}/Sensors?$filter=name eq '${sensor.name}'`)
        .then(r => {
            if (r.data.value.length > 0)
                sensor = r.data.value[0]
        })
        .catch(error => {
            debug(error)
            return null
        })
    if (!sensor['@iot.id']) {
        await http
            .post(`${serviceUrl}/Sensors`, sensor)
            .then(r => {
                if (201 != r.status) {
                }
            })
            .catch(error => {
                debug(error)
                return null
            })
    }

    var observedProperty = readObject('observedProperty.json')
    await http
        .get(`${serviceUrl}/ObservedProperties?$filter=name eq '${observedProperty.name}'`)
        .then(r => {
            if (r.data.value.length > 0)
                observedProperty = r.data.value[0]
        })
        .catch(error => {
            debug(error)
            return null
        })
    if (!observedProperty['@iot.id'])
        await http
            .post(`${serviceUrl}/ObservedProperties`, observedProperty)
            .then(r => {
                if (201 != r.status) {
                }
            })
            .catch(error => {
                debug(error)
                return null
            })

    var thing = readObject('thing.json')
    thing.name = serial
    var datastream = thing['Datastreams'][0]
    datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
    datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }

    return thing;
}

function getReturnObject(r, config) {
    var response = {}
    response['homeNr'] = "+32473404020"
    response['service'] = {}
    response['service']['protocol'] = config.pitas.protocol
    response['service']['host'] = config.pitas.host
    response['service']['port'] = config.pitas.port
    response['service']['resource'] = "/" + config.pitas.resource
    //   response['components'] = ['name', '@iot.id']
    //   response['count'] = r.data.value.length
    response.Datastreams = []

    for (var ds of r.data.value) {
        var observedProperty = ds['ObservedProperty']
        var o = new Object();
        o[observedProperty.name] = `${ds["@iot.id"]}`
        response.Datastreams.push(o)
    }

    return response
}

module.exports = {
    getReturnObject, createThing
}