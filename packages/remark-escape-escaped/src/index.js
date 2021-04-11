function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line no-useless-escape
}

module.exports = function escapeEscaped (entitiesToKeep = ['&']) {
  if (!Array.isArray(entitiesToKeep) || !entitiesToKeep.length) {
    throw new Error('remark-escape-escaped needs to be passed a configuration array as option')
  }
  const pattern = entitiesToKeep.map(escapeRegExp).join('|')
  const regex = new RegExp(`(${pattern})`)

  function locator (value, fromIndex) {
    const indices = entitiesToKeep.map(entity => value.indexOf(entity, fromIndex))
    return Math.min(...indices)
  }

  function inlineTokenizer (eat, value, silent) {
    const keep = regex.exec(value)
    if (keep) {
      if (keep.index !== 0) return true

      /* istanbul ignore if - never used (yet) */
      if (silent) return true

      eat(keep[0])({
        type: 'text',
        value: keep[0]
      })
    }
  }
  inlineTokenizer.locator = locator

  const Parser = this.Parser

  // Inject inlineTokenizer
  const inlineTokenizers = Parser.prototype.inlineTokenizers
  const inlineMethods = Parser.prototype.inlineMethods
  inlineTokenizers.keep_entities = inlineTokenizer
  inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'keep_entities')
}
