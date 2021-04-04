const debug = require('debug')('registrar:tracker')

function getReturnObject(r, config) {
    var response = {}
    response['components'] = ['name', '@iot.id']
    response['count'] = r.data.value.length
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
    getReturnObject
}