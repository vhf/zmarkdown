const express = require('express')

const munin = require('../controllers/munin')

const router = express.Router()

router.get(
  '/config/:plugin',
  munin('config')
)

router.get(
  '/:plugin',
  munin()
)

module.exports = router
