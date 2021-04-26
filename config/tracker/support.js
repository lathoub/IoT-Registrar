const debug = require('debug')('registrar:tracker')
const http = require('axios')
const fs = require('fs');
const path = require('path');

function readObject(fileName) {
    var rawData = fs.readFileSync(path.join(__dirname, fileName));
    return JSON.parse(rawData);
}

async function createThing(serviceUrl, serial) {

    var sensors = readObject('sensors.json')
    for (var i = 0; i < sensors.length; i++) {
        await http
            .get(`${serviceUrl}/Sensors?$filter=name eq '${sensors[i].name}'`)
            .then(r => {
                if (r.data.value.length > 0)
                sensors[i] = r.data.value[0]
            })
            .catch(error => {
                debug(error)
                return null
            })

        if (!sensors[i]['@iot.id']) {
            await http
                .post(`${serviceUrl}/Sensors`, sensors[i])
                .then(r => {
                    if (201 != r.status) {
                    }
                })
                .catch(error => {
                    debug(error)
                    return null
                })

            await http
                .get(`${serviceUrl}/Sensors?$filter=name eq '${sensors[i].name}'`)
                .then(r => {
                    if (r.data.value.length > 0)
                    sensors[i] = r.data.value[0]
                })
                .catch(error => {
                    debug(error)
                    return null
                })
        }
    }

    var observedProperties = readObject('observedProperties.json')
    for (var i = 0; i < observedProperties.length; i++) {
        await http
            .get(`${serviceUrl}/ObservedProperties?$filter=name eq '${observedProperties[i].name}'`)
            .then(r => {
                if (r.data.value.length > 0)
                observedProperties[i] = r.data.value[0]
            })
            .catch(error => {
                debug(error)
                return null
            })

        if (!observedProperties[i]['@iot.id']) {
            await http
                .post(`${serviceUrl}/ObservedProperties`, observedProperties[i])
                .then(r => {
                    if (201 != r.status) {
                    }
                })
                .catch(error => {
                    debug(error)
                    return null
                })

            await http
                .get(`${serviceUrl}/ObservedProperties?$filter=name eq '${observedProperties[i].name}'`)
                .then(r => {
                    if (r.data.value.length > 0)
                    observedProperties[i] = r.data.value[0]
                })
                .catch(error => {
                    debug(error)
                    return null
                })
        }
    }

    // TODO
    var thing = readObject('thing.json')
    thing.name = serial
    var datastreams = thing['Datastreams']
    for (var i = 0; i < datastreams.length; i++) {
        datastreams[i]['Sensor']           = { '@iot.id': sensor['@iot.id'] }
        datastreams[i]['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }

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