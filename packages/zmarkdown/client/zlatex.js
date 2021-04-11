import { parser as mdastParser } from './zmdast'

const defaultMdastConfig = require('../config/mdast')
const defaultLatexConfig = require('../config/latex')

export const parser = require('../renderers/latex')

export function render (
  markdown,
  cb,
  mdConfig = defaultMdastConfig,
  latexConfig = defaultLatexConfig
) {
  const processor = mdastParser(mdConfig)
  parser(processor, latexConfig)

  processor.process(markdown, (err, vfile) => {
    if (err) return cb(err)

    cb(null, vfile)
  })
}
