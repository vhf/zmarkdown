const whitespace = require('is-whitespace-character')

function escapeRegExp (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

module.exports = function inlinePlugin (ctx) {
  const emoticonClasses = ctx && ctx.classes
  const emoticonsRaw = ctx && ctx.emoticons

  if (!emoticonsRaw) {
    throw new Error('remark-emoticons needs to be passed a configuration object as option')
  }

  // Convert emoticons to lowercase
  const emoticons = Object.keys(emoticonsRaw).reduce((acc, key) => {
    acc[key.toLowerCase()] = emoticonsRaw[key]
    return acc
  }, {})

  // Create a list composed of the first character of each emoticon
  const firstChars = Object.keys(emoticons).reduce((acc, key) => {
    const firstChar = key.charAt(0)
    if (acc.indexOf(firstChar) === -1) acc.push(firstChar)
    return acc
  }, [])

  const pattern = Object.keys(emoticons).map(escapeRegExp).join('|')
  const regex = new RegExp(`(?:\\s|^)(${pattern})(?:\\s|$)`, 'i')

  function locator (value, fromIndex) {
    let lowestMatch = -1

    // Iterate on chars
    for (let c = 0; c < firstChars.length; c++) {
      const char = firstChars[c]
      let offset = 0
      let match = -1

      // Oftentimes, the first occurence is not good, so loop on all possible ones
      while (match === -1 && offset < (value.length - 1)) {
        match = value.indexOf(char, fromIndex + offset)

        // Also match uppercase
        if (match === -1 && char !== char.toUpperCase()) {
          match = value.indexOf(char.toUpperCase(), fromIndex + offset)
        }

        if (match === -1) {
          break
        // A smiley should be precedeed by at least one whitespace
        } else if (!whitespace(value[match - 1])) {
          offset = match
          match = -1
        }
      }

      if (match !== -1 && (lowestMatch === -1 || match < lowestMatch)) {
        lowestMatch = match
      }
    }

    return lowestMatch
  }

  function inlineTokenizer (eat, value, silent) {
    const keep = regex.exec(value)

    if (!keep || keep.index !== 0) return true
    if (!keep[0].startsWith(keep[1])) return true

    /* istanbul ignore if - never used (yet) */
    if (silent) return true

    const toEat = keep[1]
    const emoticon = toEat.trim()
    const src = emoticons[emoticon.toLowerCase()]

    const emoticonNode = {
      type: 'emoticon',
      value: emoticon,
      data: {
        hName: 'img',
        hProperties: {
          src: src,
          alt: emoticon
        }
      }
    }

    if (emoticonClasses) {
      emoticonNode.data.hProperties.class = emoticonClasses
    }

    eat(toEat)(emoticonNode)
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
