const debug = require('debug')('registrar:database:schema')

const FeatureOfInterest = {
    'name': 'FeatureOfInterest',
    'set': 'FeaturesOfInterest',
    'tableName': 'featureOfInterest',
    'columns': ['name', 'description', 'encodingType', 'feature'],
    'relationship': {
        'foreignKeys': [],
        'manyToMany': [],
        'navigation': ['Observations']
    }
}

const Observation = {
    'name': 'Observation',
    'set': 'Observations',
    'tableName': 'observation',
    'columns': ['phenomenonTime', 'resultTime', 'result', 'resultQuality', 'validTime', 'parameters'],
    'relationship': {
        'foreignKeys': ['datastream_id', 'featureOfInterest_id'],
        'manyToMany': [],
        'navigation': ['FeatureOfInterest', 'Datastream']
    }
}

const Datastream = {
    'name': 'Datastream',
    'set': 'Datastreams',
    'tableName': 'datastream',
    'columns': ['name', 'description', 'observationType', 'unitOfMeasurement', 'observedArea', 'phenomenonTime', 'resultTime'],
    'relationship': {
        'foreignKeys': ['sensor_id', 'observedProperty_id', 'thing_id'],
        'manyToMany': [],
        'navigation': ['ObservedProperty', 'Sensor', 'Observations', 'Thing']
    }
}

const Sensor = {
    'name': 'Sensor',
    'set': 'Sensors',
    'tableName': 'sensor',
    'columns': ['name', 'description', 'encodingType', 'metadata'],
    'relationship': {
        'foreignKeys': [],
        'manyToMany': [],
        'navigation': ['Datastreams']
    }
}

const ObservedProperty = {
    'name': 'ObservedProperty',
    'set': 'ObservedProperties',
    'tableName': 'observedProperty',
    'columns': ['name', 'description', 'definition'],
    'relationship': {
        'foreignKeys': [],
        'manyToMany': [],
        'navigation': ['Datastreams']
    }
}

const Thing = {
    'name': 'Thing',
    'set': 'Things',
    'tableName': 'thing',
    'columns': ['name', 'description', 'properties'],
    'relationship': {
        'foreignKeys': [],
        'manyToMany': [{ 'Location': 'HistoricalLocation' }],
        'navigation': ['Locations', 'HistoricalLocations', 'Datastreams']
    }
}

const Location = {
    'name': 'Location',
    'set': 'Locations',
    'tableName': 'location',
    'columns': ['name', 'description', 'encodingType', 'location'],
    'relationship': {
        'foreignKeys': [],
        'manyToMany': [{ 'Thing': 'HistoricalLocation' }],
        'navigation': ['Things', 'HistoricalLocations']
    }
}

const HistoricalLocation = {
    'name': 'HistoricalLocation',
    'set': 'HistoricalLocations',
    'tableName': 'historicalLocation',
    'columns': ['time'],
    'relationship': {
        'foreignKeys': ['thing_id', 'location_id'],
        'manyToMany': [],
        'navigation': ['Thing', 'Locations']
    }
}

const entities = [FeatureOfInterest, Observation, Datastream, Sensor, ObservedProperty, Thing, Location, HistoricalLocation]
const entitySets = ['Things', 'Locations', 'Datastreams', 'Sensors', 'Observations', 'ObservedProperties', 'FeaturesOfInterest']

function getSchema(entityName) {
    for (var entity of entities)
        if (entityName == entity.name)
            return entity
        else if (entityName == entity.set)
            return entity
    return undefined
}

module.exports = {
    FeatureOfInterest, Observation, Datastream, Sensor, ObservedProperty, Thing, Location, HistoricalLocation,
    entities, entitySets,
    getSchema
}
