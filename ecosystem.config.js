module.exports = {
  apps: [
    {
      name: "registrar",
      script: "./iot_registrar/app.js",
      watch: true,
      time: true,
      env: {
        DEBUG: "registrar:*",
        DB_password: "Aardvark00!",
        SERVICE: "tracker"
      }
    },
    {
      name: "pitas",
      script: "./pitas/app.js",
      watch: true,
      time: true,
      env: {
        DEBUG: "pitas:*",
        DB_password: "Aardvark00!",
        SERVICE: "tracker"
      }
    }
  ]
}
