var config = {
  development: {
    express: {
      port: process.env.EXPRESS_PORT || 32797,
    },
    service: 'replaced in app.js',
    pitas: {
      protocol: 'http://',
      host: 'snuffeldb.synology.me',
      port: 8080,
      resource: 'FROST-Server/v1.0',
    },
    version: 'v1.0',
  },
  production: {
    express: {
      port: process.env.EXPRESS_PORT || 32797,
    },
    service: 'replaced in app.js',
    pitas: {
      protocol: 'http://',
      host: 'snuffeldb.synology.me',
      port: 8080,
      resource: 'FROST-Server/v1.0',
    },
    version: 'v1.0',
  }
}

module.exports = config;
