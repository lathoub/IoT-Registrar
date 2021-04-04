var config = {
  development: {
    express: {
      port: process.env.EXPRESS_PORT || 8081,
    },
    service: 'replaced in app.js',
    pitas: {
      protocol: 'http://',
      host: 'localhost',
      port: 8080
    },
    version: 'v1.0',
    mariadb: {
      host: '192.168.0.157',
      user: 'patrice',
      database: 'iot_register',
      port: 3307
    }
  },
  production: {
    express: {
      port: process.env.EXPRESS_PORT || 8081,
    },
    service: 'replaced in app.js',
    pitas: {
      protocol: 'http://',
      host: 'kontich.synology.me',
      port: 8080
    },
    version: 'v1.0',
    mariadb: {
      host: '192.168.0.157',
      user: 'patrice',
      database: 'iot_register',
      port: 3307
    }
  }
}

module.exports = config;
