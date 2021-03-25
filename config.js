var config = {
  development: {
    express: {
      port: process.env.EXPRESS_PORT || 8081,
    },
    version: 'v1.0',
    mariadb: {
      host: '192.168.1.15',
      user: 'patrice',
      database: 'iot_register',
      port: 3307
    }
  },
  production: {
    express: {
      port: process.env.EXPRESS_PORT || 8081,
    },
    version: 'v1.0',
    mariadb: {
      host: '192.168.1.15',
      user: 'patrice',
      database: 'iot_register',
      port: 3307
    }
  }
}

module.exports = config;
