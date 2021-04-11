const pm2 = require('pm2')

module.exports = isConfig => (req, res) => {
  const endpoints = Object.keys(require('../factories/io-factory'))

  const supportedStats = {
    status: {
      graph: [
        'graph_title Process Status',
        'graph_vlabel'
      ],
      fields: (name) => [
        `${name}.label ${name}`,
        `${name}.critical 1`
      ]
    },
    memory: {
      stack: true,
      graph: [
        'graph_title RAM Usage',
        'graph_vlabel Bytes',
        'graph_args --base 1024 --lower-limit 0'
      ],
      fields: (name) => [
        `${name}.label ${name}`,
        `${name}.draw STACK`
      ]
    },
    cpu: {
      graph: [
        'graph_title CPU Usage',
        'graph_vlabel percent',
        'graph_args --base 1000 --lower-limit 0 --rigid',
        'graph_scale no'
      ],
      fields: (name) => `${name}.label ${name}`
    },
    event_loop_lag: {
      graph: [
        'graph_title Event Loop Lag',
        'graph_vlabel ms',
        'graph_args --lower-limit 0'
      ],
      fields: (name) => `${name}.label ${name}`
    },
    avg_per_process: {
      stack: true,
      graph: [
        'graph_title Requests Per Second Per Process',
        'graph_vlabel requests per second',
        'graph_args --lower-limit 0'
      ],
      fields: (name) => [
        `${name}.label ${name}`,
        `${name}.draw STACK`
      ]
    },
    avg_per_endpoint: {
      stack: true,
      graph: [
        'graph_title Requests Per Second Per Endpoint',
        'graph_vlabel requests per second',
        'graph_args --lower-limit 0'
      ],
      fields: () => endpoints.map(endpoint =>
        `${endpoint}.label ${endpoint}\n${endpoint}.draw STACK`)
    }
  }

  const status = {
    online: 0,
    stopped: 1,
    errored: 2
  }

  const stat = req.params.plugin
  const collected = []

  if (!Object.prototype.hasOwnProperty.call(supportedStats, stat)) {
    return res.status(500).send({
      error: `Invalid stat, given : ${stat}, ` +
        `expected one of ${JSON.stringify(supportedStats, null, 2)}.`
    })
  }

  if (isConfig) {
    run(printConfig)
  } else {
    run(printStats)
  }

  function gatherData (procList) {
    let maxMem = 0

    const procs = procList.reduce((acc, proc, i) => {
      let avgPerProcess
      let loopLag

      if (proc.pm2_env.axm_monitor) {
        avgPerProcess = endpoints.map(endpoint => {
          const metric = proc.pm2_env.axm_monitor[`${endpoint} rpm`]
          return metric ? parseFloat(metric.value) : 0
        }).reduce((sum, val) => sum + val, 0)

        loopLag = parseFloat(proc.pm2_env.axm_monitor['Event Loop Latency'].value)
      }

      const data = {
        status: proc.pm2_env.status in status ? status[proc.pm2_env.status] : 3,
        memory: proc.monit.memory,
        cpu: proc.monit.cpu,
        event_loop_lag: loopLag,
        avg_per_process: avgPerProcess
      }

      if (!maxMem && proc.pm2_env.max_memory_restart) {
        maxMem = proc.pm2_env.max_memory_restart
      }
      if (maxMem) data.maxMem = maxMem

      acc[`${proc.name}-${proc.pm_id}`] = data

      return acc
    }, {})

    const _endpoints = {
      avg_per_endpoint: endpoints.reduce((acc, endpoint) => {
        acc[endpoint] = procList.reduce((sum, proc) => {
          const metric = proc.pm2_env.axm_monitor[`${endpoint} rpm`]
          return sum + (metric ? parseFloat(metric.value) : 0)
        }, 0)
        return acc
      }, {})
    }

    return { procs, endpoints: _endpoints }
  }

  // prints a munin readable config
  function printConfig (stats) {
    if (!supportedStats[stat]) {
      return res.status(500).send({
        error: `"${stat}" not configured`
      })
    }
    const procs = stats.procs

    l(supportedStats[stat].graph.join('\n'))
    l('graph_category zmd')

    let output = ''
    if (stat === 'avg_per_endpoint') {
      output = supportedStats[stat].fields().join('\n')
    } else {
      output = Object.keys(procs).map(job => {
        const tmp = supportedStats[stat].fields(job)
        return Array.isArray(tmp)
          ? tmp.join('\n')
          : tmp
      }).join('\n')
    }
    if (supportedStats[stat].stack) {
      output = output.replace(' STACK', ' AREA')
    }
    l(output)

    pm2.disconnect()
    res.send(collected.join('\n'))
  }

  // prints a munin readable output
  function printStats (stats) {
    const procs = stats.procs

    if (stat === 'avg_per_endpoint') {
      endpoints.forEach(endpoint => {
        l(`${endpoint}.value ${stats.endpoints[stat][endpoint]}`)
      })
    } else {
      Object.keys(procs).forEach((procName) => {
        const value = procs[procName][stat]
        l(`${procName}.value ${value}`)
      })
    }

    pm2.disconnect()
    res.send(collected.join('\n'))
  }

  function run (callback) {
    pm2.connect((err) => {
      if (err) {
        return res.status(500).send({ error: err })
      }

      pm2.list((err, plist) => {
        if (err) {
          return res.status(500).send({ error: err })
        }

        plist = plist.filter(process => !process.name.startsWith('pm2'))

        callback(gatherData(plist))
      })
    })
  }

  function l (string) {
    collected.push(string)
  }
}
