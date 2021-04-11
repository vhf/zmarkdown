const io = require('@pm2/io')

const endpoints = ['html', 'epub', 'latex', 'latex-document']

module.exports = endpoints.reduce((acc, endpoint) => {
  const meter = io.meter({
    name: `${endpoint} rpm`,
    samples: 1,
    timeframe: 60
  })

  acc[endpoint] = () => {
    meter.mark()
  }

  return acc
}, {})
