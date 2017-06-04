const visit = require('unist-util-visit')

function plugin () {
  function locator (value, fromIndex) {
    return value.indexOf('*[', fromIndex)
  }

  function inlineTokenizer (eat, value, silent) {
    const regex = new RegExp(/[*]\[([^\]]*)\]:\s*(.+)\n*/)
    const keep = regex.exec(value)

    /* istanbul ignore if - never used (yet) */
    if (silent) return true
    if (!keep || keep.index !== 0) return

    return eat(keep[0])({
      type: 'abbr',
      data: {
        hName: 'abbr',
        hProperties: {
          word: keep[1],
          desc: keep[2]
        }
      },
    })
  }
  inlineTokenizer.locator = locator

  const Parser = this.Parser

  // Inject inlineTokenizer
  const inlineTokenizers = Parser.prototype.inlineTokenizers
  const inlineMethods = Parser.prototype.inlineMethods
  inlineTokenizers.abbr = inlineTokenizer
  inlineMethods.splice(0, 0, 'abbr')

  function transformer (tree) {
    const abbrs = {}
    visit(tree, 'element', find(abbrs))
    visit(tree, replace(abbrs))
  }

  function find (abbrs) {
    function one (node, index, parent) {
      if (node.tagName === 'p') {
        for (let i = 0; i < node.children.length; ++i) {
          const child = node.children[i]
          if (child.tagName === 'abbr') {
            // Store abbreviation
            abbrs[child.properties.word] = child.properties.desc
            node.children.splice(i, 1)
            i -= 1
          }
        }
        // Remove paragraph if there is no child
        if (node.children.length === 0) parent.children.splice(index, 1)
      }
    }
    return one
  }

  function replace (abbrs) {
    function escapeRegExp (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line no-useless-escape
    }

    const pattern = Object.keys(abbrs).map(escapeRegExp).join('|')
    const regex = new RegExp(`\\b(${pattern})\\b`)

    function one (node, index, parent) {

      if (Object.keys(abbrs).length === 0) return
      if (node.type !== 'text') return
      if (parent && parent.tagName === 'abbr') return

      const keep = regex.exec(node.value)
      if (keep) {
        const newTexts = node.value.split(regex)
        parent.children.splice(index, 1)
        for (let i = 0; i < newTexts.length; ++i) {
          const content = newTexts[i]
          if (abbrs.hasOwnProperty(content)) {
            parent.children.splice(index + i, 0, {
              type: 'element',
              tagName: 'abbr',
              properties: { title: abbrs[content] },
              children: [ { type: 'text', value: content } ]
            })
          } else {
            parent.children.splice(index + i, 0, {
              type: 'text',
              value: content,
            })
          }
        }
      }
    }
    return one
  }

  return transformer
}

module.exports = plugin
