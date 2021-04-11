const mdastRenderer = require('./renderers/mdast')
const htmlRenderer = require('./renderers/html')
const latexRenderer = require('./renderers/latex')

const mdastConfig = require('./config/mdast')
const htmlConfig = require('./config/html')
const latexConfig = require('./config/latex')

module.exports = (
  processor = null,
  tokenizerConfig = mdastConfig,
  processorConfig
) => {
  const parser = mdastRenderer(tokenizerConfig)

  if (processor === 'html') {
    if (typeof processorConfig === 'undefined') {
      processorConfig = htmlConfig
    }

    htmlRenderer(parser, processorConfig)
  } else if (processor === 'latex') {
    if (typeof processorConfig === 'undefined') {
      processorConfig = latexConfig
    }

    latexRenderer(parser, processorConfig)
  // No processor given: output syntax tree
  } else if (processor === null) {
    return parser.parse
  // Custom processor: use it
  } else {
    parser.use(processor, processorConfig)
  }

  // Regenerate footnotes postfix on extracts
  const doRegenerate = (processor === 'html' && processorConfig._regenerateFootnotePostfix)
  const regenerator = processorConfig._regenerateFootnotePostfix

  return (input, cb) => {
    if (typeof cb !== 'function') {
      return new Promise((resolve, reject) =>
        parser.process(input, (err, vfile) => {
          if (doRegenerate) regenerator()
          if (err) return reject(err)

          resolve(vfile)
        }))
    }

    parser.process(input, (err, vfile) => {
      if (doRegenerate) regenerator()
      if (err) return cb(err)

      cb(null, vfile)
    })
  }
}
