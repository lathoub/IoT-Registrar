const debug = require('debug')('registrar:tracker')
const http = require('axios')
const fs = require('fs');
const path = require('path');

function readObject(fileName) {
    var rawData = fs.readFileSync(path.join(__dirname, fileName));
    return JSON.parse(rawData);
}

function lookup(array, key) {
    for (var i = 0; i < array.length; i++)
        if (array[i]['name'] == key)
            return array[i]
    return null
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

            // the above post does not return anything, 
            // so we have to get the resource again for the @iot.id identifier
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

            // the above post does not return anything, 
            // so we have to get the resource again for the @iot.id identifier
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

    var thing = readObject('thing.json')
    if (!thing) return null

    thing.name = serial

    var datastreams = thing['Datastreams']

    {
        var datastream = lookup(datastreams, 'Vehicle Speed')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'NEO-6M')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'Velocity')['@iot.id'] }
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