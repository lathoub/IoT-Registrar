const debug = require('debug')('registrar')
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
        }
        if (!sensors[i]['@iot.id'])
            return null
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
        }
        if (!observedProperties[i]['@iot.id'])
            return null
    }

    var thing = readObject('thing.json')
    if (!thing) return null

    thing.name = serial

    var datastreams = thing['Datastreams']

    {
        var datastream = lookup(datastreams, 'AirTemperature')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'SHT85')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'AirTemperature')['@iot.id'] }
    }

    {
        var datastream = lookup(datastreams, 'RelativeHumidity')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'SHT85')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'RelativeHumidity')['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'PM10')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'SPS30')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'PM10')['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'PM25')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'SPS30')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'PM25')['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'NO2')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'ZE03')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'NO2')['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'SoundPressure')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'SEN0232')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'SoundPressure')['@iot.id'] }
    }
    {
        var datastream = lookup(datastreams, 'Battery Level')
        datastream['Sensor'] = { '@iot.id': lookup(sensors, 'LiPo')['@iot.id'] }
        datastream['ObservedProperty'] = { '@iot.id': lookup(observedProperties, 'Voltage')['@iot.id'] }
    }

    return thing;
}

function getReturnObject(response, r, config) {

    response.sendFrequency = 10
    response.time = new Date().toISOString()
    response.cnt = r.data.value.length
    response.ds = []

    var freq = config.frequency || 10
    var use = config.use || 1

    for (var ds of r.data.value) {
        var observedProperty = ds['ObservedProperty']
        var o = new Object();
        o[observedProperty.name] = `${ds["@iot.id"]},${freq},${use}`
        response.ds.push(o)
    }
}

module.exports = {
    getReturnObject, createThing
}