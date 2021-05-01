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
                    if (201 != r.status)
                        return null
                    var location = r.headers['location']
                    var id = location.substring(location.lastIndexOf("(") + 1, location.lastIndexOf(")"));
                    sensors[i]['@iot.id'] = id
                })
                .catch(error => {
                    debug(error)
                    return null
                })

            // the above post does not return anything, 
            // so we have to get the resource again for the @iot.id identifier
            if (!sensors[i]['@iot.id'])
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
                    if (201 != r.status)
                        return null
                    var location = r.headers['location']
                    var id = location.substring(location.lastIndexOf("(") + 1, location.lastIndexOf(")"));
                    observedProperties[i]['@iot.id'] = id
                })
                .catch(error => {
                    debug(error)
                    return null
                })

            // the above post does not return anything, 
            // so we have to get the resource again for the @iot.id identifier
            if (!observedProperties[i]['@iot.id'])
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
        var datastream = lookup(datastreams, 'Vehicle Tracking')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'NEO-6M')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'Velocity')['@iot.id'] }
    }

    return thing;
}

function getReturnObject(response, r, config) {
    response.cnt = r.data.value.length
    response.ds = []

    for (var ds of r.data.value) {
        var observedProperty = ds['ObservedProperty']
        var o = new Object();
        o[observedProperty.name] = `${ds["@iot.id"]}`
        response.ds.push(o)
    }

    return response
}

module.exports = {
    getReturnObject, createThing
}