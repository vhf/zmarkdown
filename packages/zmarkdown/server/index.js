/* eslint-disable no-console */
const Sentry = require('@sentry/node')
const express = require('express')
const cors = require('cors')
const path = require('path')

const zmdVersion = require('../package.json').version

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.SENTRY_RELEASE || zmdVersion,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.ZDS_ENVIRONMENT
})

const app = express()

// Sentry error handling
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())

app.use(cors())

// Expose an image for tests
if (process.env.ZMD_ENV !== 'production') {
  app.use('/static', express.static(path.join(__dirname, 'static')))
}

// Depend on routers
app.use('/', require('./routes/endpoints'))
app.use('/munin', require('./routes/munin'))

const server = app.listen(process.env.PORT || 27272, () => {
  const host = server.address().address
  const port = server.address().port

  console.log('zmarkdown server listening at http://%s:%s', host, port)
})
