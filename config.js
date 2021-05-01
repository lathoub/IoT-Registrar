var config = {
  development: {
    express: {
      port: process.env.EXPRESS_PORT || 32797,
    },
    service: 'replaced in app.js',
    pitas: 'http://snuffeldb.synology.me:8080/FROST-Server/v1.0',
  },
  production: {
    express: {
      port: process.env.EXPRESS_PORT || 32797,
    },
    service: 'replaced in app.js',
    pitas: 'http://snuffeldb.synology.me:8080/FROST-Server/v1.0',
  }
}

module.exports = config;
