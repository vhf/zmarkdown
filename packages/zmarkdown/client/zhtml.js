import { parser as mdastParser } from './zmdast'

const defaultMdastConfig = require('../config/mdast')
const defaultHtmlConfig = require('../config/html')

export const parser = require('../renderers/html')

export function render (
  markdown,
  cb,
  mdConfig = defaultMdastConfig,
  htmlConfig = defaultHtmlConfig
) {
  const processor = mdastParser(mdConfig)
  parser(processor, htmlConfig)

  processor.process(markdown, (err, vfile) => {
    if (err) return cb(err)

    cb(null, vfile)
  })
}
