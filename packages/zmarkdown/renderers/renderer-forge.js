module.exports = (base, defaultPluginList, postProcessorList) => config => {
  // Use defaults
  if (!config.disableTokenizers) {
    config.disableTokenizers = {
      internal: [],
      meta: [],
      inline: []
    }
  }

  const disabledInternalTokenizers = config.disableTokenizers.internal || []

  if (!config.extraPlugins) {
    config.extraPlugins = {}
  }

  // Create an unified list of plugins
  const pluginList = Object.assign({}, defaultPluginList, config.extraPlugins)
  const pluginNames = Object.keys(pluginList)

  const postProcessorNames = Object.keys(postProcessorList)

  const filteredPlugins = pluginNames
    .filter(name => !disabledInternalTokenizers.includes(name))

  const filteredPostProcessors = postProcessorNames
    .filter(name => {
      const ppc = config.postProcessors

      return (ppc && ppc[name]) ? Boolean(ppc[name]) : false
    })

  for (const pluginName of filteredPlugins) {
    base.use(pluginList[pluginName], config[pluginName])
  }

  // Add postprocessors, that are handled differently
  for (const postProcessorName of filteredPostProcessors) {
    if (typeof config.postProcessors[postProcessorName] === 'boolean') {
      base.use(postProcessorList[postProcessorName])
    } else {
      base.use(postProcessorList[postProcessorName], config.postProcessors[postProcessorName])
    }
  }

  return base
}
