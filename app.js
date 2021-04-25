process.browser = true
global.window = { process: { type: 'renderer' } }

const debug = require('debug')('registrar:http')
const app = require('./index')

var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];

config.service = process.env.SERVICE

var server = app.listen(config.express.port, function (error) {
  if (error) {
    debug('Unable to listen for connections', error)
    process.exit(10)
  }

  debug(`(${env}) IoT Registrar listening on port ${config.express.port}`)
})

// Handle ^C
process.on('SIGINT', function () {
  server.close()
  process.exit()
});
