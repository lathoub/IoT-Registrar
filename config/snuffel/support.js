const debug = require('debug')('registrar:tracker')
const http = require('axios')
const fs = require('fs')
const path = require('path')

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

        if (!sensors[i]['@iot.id'])
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

        if (!observedProperties[i]['@iot.id'])
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
    }

    var thing = readObject('thing.json')
    if (!thing) return null

    thing.name = serial

    var datastreams = thing['Datastreams']

    {
        var datastream = lookup(datastreams, 'Air Temperature DS')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }

    {
        var datastream = lookup(datastreams, 'Relative Luchtvochtigheid')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'PM10')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'PM25')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'NO2')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'Geluidsdruk')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'Spanning')
        datastream['Sensor'] = { '@iot.id': sensor['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': observedProperty['@iot.id'] }
    }

    return thing;
}

function getReturnObject(r, config) {

    var response = {}

    response['service'] = config.pitas.protocol + config.pitas.host + ':' + config.pitas.port + '/' + config.pitas.resource

    response.time = new Date().toISOString()
    response.sendFrequency = 12
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

    return response
}

module.exports = {
    getReturnObject, createThing
}