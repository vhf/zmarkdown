function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line no-useless-escape
}

const SPACE = ' '

module.exports = function inlinePlugin (ctx) {
  const emoticonClasses = ctx && ctx.classes
  const emoticons = ctx && ctx.emoticons

  if (!emoticons) {
    throw new Error('remark-emoticons needs to be passed a configuration object as option')
  }

  for (const [key, val] of Object.entries(emoticons)) {
    emoticons[key.toLowerCase()] = val
  }

  const pattern = Object.keys(emoticons).map(escapeRegExp).join('|')

  const regex = new RegExp(`(\\s|^)(${pattern})(\\s|$)`, 'i')

  function locator (value, fromIndex) {
    const keep = regex.exec(value)
    if (keep && value[keep.index] === SPACE) return keep.index + 1
    return -1
  }

  function inlineTokenizer (eat, value, silent) {
    const keep = regex.exec(value)
    if (keep) {
      if (keep.index !== 0) return true

      /* istanbul ignore if - never used (yet) */
      if (silent) return true

      let toEat = keep[0]
      if (toEat.charAt(toEat.length - 1) === SPACE) {
        toEat = toEat.substring(0, toEat.length - 1)
      }
      const emoticon = toEat.trim()
      const src = emoticons[emoticon.toLowerCase()]

      const emoticonNode = {
        type: 'emoticon',
        value: emoticon,
        data: {
          hName: 'img',
          hProperties: {
            src: src,
            alt: emoticon,
          },
        },
      }

      if (emoticonClasses) {
        emoticonNode.data.hProperties.class = emoticonClasses
      }

      eat(toEat)(emoticonNode)
    }
  }

  inlineTokenizer.locator = locator

  const Parser = this.Parser

  // Inject inlineTokenizer
  const inlineTokenizers = Parser.prototype.inlineTokenizers
  const inlineMethods = Parser.prototype.inlineMethods
  inlineTokenizers.emoticons = inlineTokenizer
  inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'emoticons')

  const Compiler = this.Compiler
  if (Compiler) {
    const visitors = Compiler.prototype.visitors
    if (!visitors) return
    visitors.emoticon = (node) => node.value
  }
}
