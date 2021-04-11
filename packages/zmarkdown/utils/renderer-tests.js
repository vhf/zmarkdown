const clone = require('clone')

const zmarkdown = require('../common')

const defaultMdastConfig = clone(require('../config/mdast'))
const defaultHtmlConfig = clone(require('../config/html'))
const defaultLatexConfig = clone(require('../config/latex'))

defaultMdastConfig.disableTokenizers = {
  internal: ['textr'],
  meta: [],
  inline: []
}
defaultMdastConfig.ping.pingUsername = () => false

defaultHtmlConfig.disableTokenizers = {
  internal: ['highlight']
}
defaultHtmlConfig.postfixFootnotes = '-shortId'
// Remove custom handlers (only code for now)
defaultHtmlConfig.bridge.handlers = {}
defaultHtmlConfig.postProcessors.codeHighlight = false

module.exports.defaultMdastConfig = defaultMdastConfig

module.exports.defaultHtmlConfig = defaultHtmlConfig

module.exports.defaultLatexConfig = defaultLatexConfig

module.exports.configOverride = (a, b) => Object.assign({}, a, b)

module.exports.renderAs = type => (mdastConfig, renderConfig) => {
  let usedMdastConfig = mdastConfig
  let usedRenderConfig = renderConfig

  const renderWithConfig = (input, vfile) => {
    if (!vfile) {
      return zmarkdown(type, usedMdastConfig, usedRenderConfig)(input)
        .then(vfile => vfile.contents.trim())
    } else {
      return zmarkdown(type, usedMdastConfig, usedRenderConfig)(input)
    }
  }

  // Handle case where no config was given
  if (typeof mdastConfig === 'string') {
    usedMdastConfig = defaultMdastConfig
    usedRenderConfig = type === 'latex' ? defaultLatexConfig : defaultHtmlConfig

    return renderWithConfig(mdastConfig, renderConfig)
  }

  return renderWithConfig
}
