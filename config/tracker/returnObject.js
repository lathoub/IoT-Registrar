const debug = require('debug')('registrar:tracker')

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
    getReturnObject
}