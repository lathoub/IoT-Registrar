import { join } from 'path'
import { app } from './app.js'

app.listen(process.env.PORT, function (error) {
  if (error) {
    console.log('Unable to listen for connections', error)
    process.exit(10)
  }

  console.log(`IOT Registrar listening on port ${process.env.PORT}`)
})