import express, { json } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { major } from 'semver'
import favicon from 'serve-favicon'
import { join } from 'path'
import YAML from 'yaml'
import { readFileSync } from 'fs'
import utils from './utils/utils.js'
import encodings from './middleware/encodings.js'
import apiVersion from './middleware/apiversion.js'
import apiKey from './middleware/apikey.js'
import iotre from './routes/iotre.js'

export const app = express()

const __dirname = import.meta.dirname
if (__dirname === undefined)
  console.log('need node 20.16 or higher')

// read application configuration from iotregistrar.yml
const configPath = join(__dirname, '../configuration')
const yamlStr = readFileSync(join(configPath, 'iotregistrar.yml'))
global.config = YAML.parse(yamlStr.toString())

// read provider configuration from providers
global.config.providers = {}
let providersDirs = utils.getDirectories(process.env.PROVIDER_PATH || join(__dirname, "..", "providers"))
providersDirs.forEach ((dir) => {
  const yamlStr = readFileSync(join(dir, 'config.yml'))
  global.config.providers[dir.match(/([^\/]*)\/*$/)[1]] = YAML.parse(yamlStr.toString())
})

//app.use(morgan(':method :url :response-time', { stream: { write: msg => console.log(msg) } }));

app.use(cors()); // Enable All CORS Requests

// For HTML rendering
app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

app.use(favicon(join(__dirname,'public', 'images', 'favicon.ico')));

app.use(express.static(join(__dirname, 'public')));
app.use(json());
app.use(express.text());

// No need to tell the world what tools we are using, it only gives
// out information to not-so-nice people
app.disable('x-powered-by');

app.use(apiKey)
app.use(encodings)
app.use(apiVersion)

// Mount API on this path
const mountPath = process.env.ID // from config
// (ADR) /core/uri-version: Include the major version number in the URI
// https://gitdocumentatie.logius.nl/publicatie/api/adr/#/core/uri-version
const serviceRoot = `/${mountPath}/v${major(process.env.APIVERSION)}`

app.use(serviceRoot, iotre)

// (ADR) /core/http-methods: Only apply standard HTTP methods
// https://gitdocumentatie.logius.nl/publicatie/api/adr/#/core/http-methods
app.all('*', function (req, res, next) {
  res.status(405).json({ 'code': `Method Not Allowed`, 'description': `Not allowed` })
})
