var config = {
  development: {
    express: {
      port: process.env.EXPRESS_PORT || 32797,
    },
    service: 'replaced in app.js',
    pitas: 'https://stapi.snuffeldb.synology.me/FROST-Server/v1.1',
  },
  production: {
    express: {
      port: process.env.EXPRESS_PORT || 32797,
    },
    service: 'replaced in app.js',
    pitas: 'https://stapi.snuffeldb.synology.me/FROST-Server/v1.1',
  }
}

module.exports = config;
