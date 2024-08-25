import urlJoin from 'url-join'
import utils from '../../../utils/utils.js'

function getLinks(neutralUrl, format, name, links) {

  function getTypeFromFormat(format) {
    var _formats = ['json', 'html']
    var _encodings = ['application/json', 'text/html']
  
    var i = _formats.indexOf(format);
    return _encodings[i]
  }
  
  links.push({ href: urlJoin(neutralUrl, `?f=${format}`), rel: `self`, type: getTypeFromFormat(format), title: `The Document` })
  utils.getAlternateFormats(format, ['json', 'html']).forEach(altFormat => {
    links.push({ href: urlJoin(neutralUrl, `?f=${altFormat}`), rel: `alternate`, type: getTypeFromFormat(altFormat), title: `The Document as ${altFormat}` })
  })
}

function getMetaData(neutralUrl, format, name, document) {

  var content = {}
  // A local identifier for the collection that is unique for the dataset;
  content.id = name // required
  // An optional title and description for the collection;
  content.title = document.name
  content.description = document.description
  content.attribution = document.attribution
  content.serviceUrl = document.url
  content.links = []

  getLinks(neutralUrl, format, name, content.links)

  // An optional indicator about the type of the items in the collection 
  // (the default value, if the indicator is not provided, is 'feature').
  content.itemType = 'provider'

  return content
}

function get(neutralUrl, format, providerId, callback) {

  var provider = global.config.providers[providerId]
  if (!provider)
    return callback({ 'httpCode': 404, 'code': `Provider not found: ${providerId}`, 'description': 'Make sure you use an existing providerId. See /Collections' }, undefined);

  var content = getMetaData(neutralUrl, format, providerId, provider)

  return callback(undefined, content);
}

export default {
  get
}