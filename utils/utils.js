const debug = require('debug')('pitas:utils')
var path = require('path')

function getServiceUrl(req) {
  // remove the optional extension from the baseUrl
  var root = req.baseUrl.replace(/\//g, '')

  const proxyHost = req.headers["x-forwarded-host"]
  var host = proxyHost || req.headers.host
  host = path.join(host, root)
  var serviceUrl = `${req.protocol}://${host}`

  return new URL(serviceUrl);
}

function extractId(s) {
  if (isNullOrEmpty(s)) return undefined
  return parseInt(s.replace(/[\(\)]/g, ''))
}

function isNullOrEmpty(value) {
  if (value === undefined) return true;
  return (Object.keys(value).length === 0 && value.constructor === Object)
}

function last(array) {
  return array[array.length - 1];
}

function beforeLast(array) {
  return array[array.length - 2];
}

function join(array) {
  var result = ''
  for (element of array) {
    result += (isNaN(element) ? `'${element.replace('Z', '')}'` : `${element}`) + ','
  }
  return result.slice(0, -1)
}

module.exports = {
  getServiceUrl, extractId, isNullOrEmpty, join, last, beforeLast
}