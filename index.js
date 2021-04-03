const express = require('express')
const debug = require('debug')('registrar:route')

var helmet = require('helmet')

var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];
require('dotenv').config()

var database = require('./database')

// https://stackoverflow.com/questions/11744975/enabling-https-on-express-js
//var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
//var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

const app = express()

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.set('etag', false)
app.disable('x-powered-by');
//app.use(helmet())

const API_VERSION = "v1.0"
const version = config.api_version || API_VERSION;
const service = config.service;

start()

async function start() {
  await database.connect()

  app.use(`/${service}/${version}/`, require('./route'))
  debug(`/${service}/${version}/ running`)
}

module.exports = app
