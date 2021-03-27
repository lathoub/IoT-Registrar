const router = require('express').Router()
const asyncHandler = require('express-async-handler') // https://www.npmjs.com/package/express-async-handler https://zellwk.com/blog/async-await-express/
const registrar = require('./controllers/registrar')

router.post('/Register', asyncHandler(registrar.Register))
router.post('/Update',   asyncHandler(registrar.Update))

module.exports = router
