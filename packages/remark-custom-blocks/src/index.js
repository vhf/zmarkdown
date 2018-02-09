const spaceSeparated = require('space-separated-tokens')

function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line no-useless-escape
}

const C_NEWLINE = '\n'
const C_FENCE = '|'

module.exports = function blockPlugin (blocks = {}, allowTitle = false) {
  const pattern = Object
    .keys(blocks)
    .map(escapeRegExp)
    .join('|')
  if (!pattern) {
    throw new Error('remark-custom-blocks needs to be passed a configuration object as option')
  }
  let regex = new RegExp(`\\[\\[(${pattern})\\]\\]`)
  if (allowTitle) {
    regex = new RegExp(`\\[\\[(${pattern})( ?\\| ?((\\w| |'|-|")+))?\\]\\]`)
  }
  function blockTokenizer (eat, value, silent) {
    const now = eat.now()
    const keep = regex.exec(value)
    if (!keep) return
    if (keep.index !== 0) return

    /* istanbul ignore if - never used (yet) */
    if (silent) return true

    const linesToEat = []
    const content = []

    let idx = 0
    while ((idx = value.indexOf(C_NEWLINE)) !== -1) {
      const next = value.indexOf(C_NEWLINE, idx + 1)
      // either slice until next NEWLINE or slice until end of string
      const lineToEat = next !== -1 ? value.slice(idx + 1, next) : value.slice(idx + 1)
      if (lineToEat[0] !== C_FENCE) break
      // remove leading `FENCE ` or leading `FENCE`
      const line = lineToEat.slice(lineToEat.startsWith(`${C_FENCE} `) ? 2 : 1)
      linesToEat.push(lineToEat)
      content.push(line)
      value = value.slice(idx + 1)
    }

    const contentString = content.join(C_NEWLINE)
    const stringToEat = `${keep[0]}${C_NEWLINE}${linesToEat.join(C_NEWLINE)}`

    const add = eat(stringToEat)
    const exit = this.enterBlock()
    const contents = {
      type: `body${keep[1]}CustomBlock`,
      data: {
        hName: 'div',
        hProperties: {
          className: 'custom-block-body',
        },
      },
      children: this.tokenizeBlock(contentString, now),
    }

    exit()

    const classString = blocks[keep[1]]
    const classList = spaceSeparated.parse(classString)
    const blockChildren = [contents]
    if (allowTitle && keep[3]) {
      const titleNode = {
        type: `heading${keep[1]}CustomBlock`,
        data: {
          hName: 'div',
          hProperties: {
            className: 'custom-block-heading',
          },
        },
        children: [
          {
            value: keep[3],
            type: 'text',
          }],
      }
      blockChildren.splice(0, 0, titleNode)
    }

    return add({
      type: `${keep[1]}CustomBlock`,
      children: blockChildren,
      data: {
        hName: 'div',
        hProperties: {
          className: `custom-block ${classList}`,
        },
      },
    })
  }

  const Parser = this.Parser

  // Inject blockTokenizer
  const blockTokenizers = Parser.prototype.blockTokenizers
  const blockMethods = Parser.prototype.blockMethods
  blockTokenizers.custom_blocks = blockTokenizer
  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, 'custom_blocks')

  // Inject into interrupt rules
  const interruptParagraph = Parser.prototype.interruptParagraph
  const interruptList = Parser.prototype.interruptList
  const interruptBlockquote = Parser.prototype.interruptBlockquote
  interruptParagraph.splice(interruptParagraph.indexOf('fencedCode') + 1, 0, ['custom_blocks'])
  interruptList.splice(interruptList.indexOf('fencedCode') + 1, 0, ['custom_blocks'])
  interruptBlockquote.splice(interruptBlockquote.indexOf('fencedCode') + 1, 0, ['custom_blocks'])
}
