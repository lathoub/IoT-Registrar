const debug = require('debug')('registrar:tracker')

function getReturnObject(r, config) {

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

    return response
}

module.exports = {
    getReturnObject
}