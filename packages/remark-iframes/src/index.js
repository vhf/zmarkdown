const URL = require('url')
const urlParse = URL.parse
const URLSearchParams = URL.URLSearchParams

module.exports = function plugin (opts) {
  if (typeof opts !== 'object' || !Object.keys(opts).length) {
    throw new Error('remark-iframes needs to be passed a configuration object as option')
  }

  function extractProvider (url) {
    const hostname = urlParse(url).hostname
    return opts[hostname]
  }

  function blockTokenizer (eat, value, silent) {
    let eatenValue = ''
    let url = ''
    if (!value.startsWith('!(')) {
      return false
    }
    for (let i = 0; i < value.length && value[i - 1] !== ')'; i++) {
      eatenValue += value[i]
      if (value[i] !== '!' && value[i] !== '(' && value[i] !== ')') {
        url += value[i]
      }
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) return true

    const provider = extractProvider(url)
    if (
      (!provider || provider.disabled === true) ||
      (provider.match && provider.match instanceof RegExp && !provider.match.test(url))
    ) {
      if (!eatenValue.startsWith('!(http')) return
      eat(eatenValue)({
        type: 'paragraph',
        children: [{
          type: 'text',
          value: eatenValue,
        }],
      })
    } else {
      const finalUrl = computeFinalUrl(provider, url)
      const thumbnail = computeThumbnail(provider, finalUrl)
      eat(eatenValue)({
        type: 'iframe',
        src: url,
        data: {
          hName: provider.tag,
          hProperties: {
            src: finalUrl,
            width: provider.width,
            height: provider.height,
            allowfullscreen: true,
            frameborder: '0',
          },
          thumbnail: thumbnail,
        },
      })
    }
  }
  blockTokenizer.locator = locator

  const Parser = this.Parser

  // Inject blockTokenizer
  const blockTokenizers = Parser.prototype.blockTokenizers
  const blockMethods = Parser.prototype.blockMethods
  blockTokenizers.iframes = blockTokenizer
  blockMethods.splice(blockMethods.indexOf('blockquote') + 1, 0, 'iframes')

  const Compiler = this.Compiler
  if (Compiler) {
    const visitors = Compiler.prototype.visitors
    if (!visitors) return
    visitors.iframe = (node) => `!(${node.src})`
  }
}

function computeFinalUrl (provider, url) {
  let finalUrl = url
  let parsed = urlParse(finalUrl)
  finalUrl = URL.format(parsed)
  if (provider.ignoredQueryStrings && parsed.search) {
    const search = new URLSearchParams(parsed.search)
    provider.ignoredQueryStrings.forEach(ignored => search.delete(ignored))
    parsed.search = search.toString()
  }
  finalUrl = URL.format(parsed)
  if (provider.replace && provider.replace.length) {
    provider.replace.forEach((rule) => {
      const [from, to] = rule
      if (from && to) finalUrl = finalUrl.replace(from, to)
      parsed = urlParse(finalUrl)
    })
  }

  if (provider.removeFileName) {
    parsed.pathname = parsed.pathname.substring(0, parsed.pathname.lastIndexOf('/'))
  }
  finalUrl = URL.format(parsed)
  if (provider.append) {
    finalUrl += provider.append
  }

  if (provider.removeAfter && finalUrl.includes(provider.removeAfter)) {
    finalUrl = finalUrl.substring(0, finalUrl.indexOf(provider.removeAfter))
  }

  return finalUrl
}

function computeThumbnail (provider, url) {
  let thumbnailURL = 'default image'
  const thumbnailConfig = provider.thumbnail
  if (thumbnailConfig && thumbnailConfig.format) {
    thumbnailURL = thumbnailConfig.format
    Object
      .keys(thumbnailConfig)
      .filter((key) => key !== 'format')
      .forEach((key) => {
        const search = new RegExp(`{${key}}`, 'g')
        const replace = new RegExp(thumbnailConfig[key]).exec(url)
        if (replace.length) thumbnailURL = thumbnailURL.replace(search, replace[1])
      })
  }
  return thumbnailURL
}

function locator (value, fromIndex) {
  return value.indexOf('!(http', fromIndex)
}
