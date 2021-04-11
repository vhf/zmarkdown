// This is the same as the `html` renderer, but highlight & katex were removed.
// We need to duplicate the file because otherwise Webpack would
// load the modules anyway...
import { parser as mdastParser } from './zmdast'

const rendererForge = require('../renderers/renderer-forge')

const remark2rehype = require('remark-rehype')
const rehypeStringify = require('rehype-stringify')

const defaultMdastConfig = require('../config/mdast')
const defaultHtmlConfig = require('../config/html')

const defaultStringifierList = {
  slug: require('rehype-slug'),
  autolinkHeadings: require('rehype-autolink-headings'),
  footnotesTitles: require('rehype-footnotes-title'),
  htmlBlocks: require('rehype-html-blocks'),
  postfixFootnotes: require('rehype-postfix-footnote-anchors'),
  sanitize: require('rehype-sanitize')
}

const postProcessorList = {
  wrapCode: require('../postprocessors/html-wrap-code'),
  iframeWrappers: require('../postprocessors/html-iframe-wrappers'),
  footnotesReorder: require('../postprocessors/html-footnotes-reorder')
}

export function parser (tokenizer, config) {
  tokenizer
    .use(remark2rehype, config.bridge)

  rendererForge(
    tokenizer,
    defaultStringifierList,
    postProcessorList
  )(config)

  return tokenizer
    .use(rehypeStringify, config.stringify)
}

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
