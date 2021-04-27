module.exports = {
  apps: [
    {
      name: "registrar",
      script: "./iot_registrar/app.js",
      watch: true,
      time: true,
      env: {
        DEBUG: "registrar:*",
        SERVICE: "snuffel"
      }
    }
  ]
}
