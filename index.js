const fs = require('fs')
const unified = require('unified')
const reParse = require('remark-parse')
const math = require('remark-math')
const katex = require('rehype-katex')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')
const inspect = require('unist-util-inspect')
const textr = require('remark-textr')


const abbr = require('./packages/abbr')
const align = require('./packages/align')
const trailingSpaceHeading = require('./packages/trailing-space-heading')
const headingShifter = require('./packages/heading-shift')
const htmlBlocks = require('./packages/html-blocks')
const escapeEscaped = require('./packages/escape-escaped')
const kbd = require('./packages/kbd')
const customBlocks = require('./packages/custom-blocks')
const subSuper = require('./packages/sub-super')
const emoticons = require('./packages/emoticons')
const numberedFootnotes = require('./packages/numbered-footnotes')
const footnotesTitles = require('./packages/footnotes-title')
const iframes = require('./packages/iframes')
const comments = require('./packages/comments')

const defaultConfig = require('./config')

const fromFile = (filepath) => fs.readFileSync(filepath)

const processor = (config) =>
  unified()
    .use(reParse, config.reParse)
    .use(textr, config.textr)
    .use(trailingSpaceHeading)
    .use(headingShifter, config.headingShifter)
    .use(numberedFootnotes)
    .use(remark2rehype, config.remark2rehype)
    .use(footnotesTitles, config.footnotesTitles)
    .use(customBlocks, config.customBlocks)
    .use(align)
    .use(abbr)
    .use(math, config.math)
    .use(katex, config.katex)
    .use(htmlBlocks)
    .use(escapeEscaped, config.escapeEscaped)
    .use(kbd)
    .use(comments)
    .use(iframes, config.iframes)
    .use(subSuper)
    .use(emoticons, config.emoticons)
    .use(stringify)

const parse = (opts) => (zmd) => processor(opts).parse(zmd)
const transform = (opts) => (ast) => processor(opts).runSync(ast)
const render = (opts) => (ast) => processor(opts).stringify(ast)

const renderString = (opts) => (string) => render(opts)(transform(opts)(parse(opts)(string)))
const renderFile = (opts) => (filepath) => renderString(opts)(fromFile(filepath))

module.exports = (opts = defaultConfig) => ({
  inspect: inspect,
  parse: parse(opts),
  transform: transform(opts),
  renderFile: renderFile(opts),
  renderString: renderString(opts),
})
