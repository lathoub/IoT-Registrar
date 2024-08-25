import { join } from 'path'
import { app } from './app.js'

const __dirname = import.meta.dirname;
if (__dirname === undefined) console.log("need node 20.16 or higher");

app.listen(process.env.PORT, function (error) {
  if (error) {
    console.log('Unable to listen for connections', error)
    process.exit(10)
  }

  console.log(`IOT Registrar listening on port ${process.env.PORT}`)
})