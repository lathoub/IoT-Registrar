const resourcePathTypes = {
    UNKNOWN: 'unknown',
    ENTITY: 'entity',
    ENTITYSET: 'entitySet',
    LINKNAME: 'linkName',
    ASSOCIATIONLINK: 'associationLink',
    PROPERTYNAME: 'propertyName',
    PROPERTYVALUE: 'propertyValue',
}

function getPropertyName(resourcePath) {
    for (var i = resourcePath.length - 1; i >= 0; i--) {
        var path = resourcePath[i]
        if (path.type == resourcePathTypes.PROPERTYNAME)
            return path.name
    }
    return undefined
}

function getResourcePathType(resourcePath, entities, entitySets) {
    for (var el of entities)
        if (resourcePath == el.name)
            return resourcePathTypes.ENTITY
    if (entitySets.includes(resourcePath))
        return resourcePathTypes.ENTITYSET
    else if ('$ref' == resourcePath)
        return resourcePathTypes.ASSOCIATIONLINK
    else if ('$value' == resourcePath)
        return resourcePathTypes.PROPERTYVALUE

    // possibly a propertyName, assert later
    return resourcePathTypes.UNKNOWN
}

module.exports = {
    resourcePathTypes, getPropertyName, getResourcePathType
}
