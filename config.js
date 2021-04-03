var config = {
  development: {
    express: {
      port: process.env.EXPRESS_PORT || 8080,
    },
    pitas: {
      serviceUrl: 'http://localhost:8080/v1.0',
    },
    version: 'v1.0',
    service: process.env.SERVICE || 'registrar',
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
    pitas: {
      serviceUrl: 'http://localhost:8080/v1.0',
    },
    version: 'v1.0',
    service: process.env.SERVICE || 'registrar',
    mariadb: {
      host: '192.168.0.157',
      user: 'patrice',
      database: 'iot_register',
      port: 3307
    }
  }
}

module.exports = config;
