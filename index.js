const express = require('express')
const debug = require('debug')('registrar:route')

const app = express()

app.use(express.json());

start()

async function start() {
  app.use(`/`, require('./route'))
  debug(`/ running`)
}

module.exports = app