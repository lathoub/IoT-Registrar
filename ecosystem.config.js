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
    }
  ]
}
