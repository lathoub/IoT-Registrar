const router = require('express').Router()
const asyncHandler = require('express-async-handler') // https://www.npmjs.com/package/express-async-handler https://zellwk.com/blog/async-await-express/
const registrar = require('./controllers/registrar')

router.post('/', asyncHandler(registrar.Register))
router.get('/Things(:id)', asyncHandler(registrar.Things))

module.exports = router
