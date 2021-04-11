/* Dependencies. */
const all = require('rebber/dist/all')
const one = require('rebber/dist/one')
const defaultCodeStringifier = require('rebber/dist/types/code').macro
const has = require('has')

/* Expose. */
module.exports = figure

const defaultMacros = {
  blockquote: (_, innerText, caption = 'Anonymous') =>
    `\\begin{Quotation}[${caption}]\n${innerText}\n\\end{Quotation}\n\n`,
  code: (ctx, code, caption, extra) => {
    const codeStringifier = (has(ctx, 'code') && ctx.code) || defaultCodeStringifier

    // Remove the two last line feed
    const rebberCode = codeStringifier(code, extra.language, extra.others).slice(0, -2)
    return `${rebberCode}\n\\captionof{listing}{${caption}}\n\n`
  },
  image: (_1, _2, caption, extra) =>
    '\\begin{center}\n' +
    `\\includegraphics${extra.width ? `[${extra.width}]` : ''}{${extra.url}}\n` +
    `\\captionof{figure}{${caption}}\n` +
    '\\end{center}\n'
}

const makeExtra = {
  blockquote: node => {},
  code: (node) => {
    return {
      language: node.lang || 'text',
      others: node.meta
    }
  },
  image: node => ({ url: node.url, width: '\\linewidth' })
}

/* Stringify a Figure `node`. */
function figure (ctx, node, index, parent) {
  const type = node.children[0].type
  const macro = (has(ctx, 'figure') && has(ctx.figure, type) && ctx.figure[type]) ||
    (has(defaultMacros, type) && defaultMacros[type])

  let caption = ''
  if (node.children.length) {
    caption = node.children
      .filter(captionNode => captionNode.type === 'figcaption')
      .map(captionNode => all(ctx, captionNode))
      .join('')
  }

  node.caption = caption // allows to add caption to the default processing
  if (!macro) {
    node.children[0].caption = caption
    return one(ctx, node.children[0], 0, node)
  }

  const wrappedNode = node.children[0]
  wrappedNode.caption = node.caption

  node.children = node.children.filter(node => node.type !== 'figcaption')
  if (node.children.length === 1) {
    node.children = node.children[0].children
  }

  const extra = has(makeExtra, type) ? makeExtra[type](wrappedNode) : undefined
  const innerText = all(ctx, node) || node.value || ''

  return macro(ctx, innerText.trim(), caption, extra)
}
