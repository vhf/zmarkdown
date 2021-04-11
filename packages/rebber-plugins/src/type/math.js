/* Dependencies. */
const all = require('rebber/dist/all')
const has = require('has')

/* Expose. */
module.exports = math

const defaultMacros = {
  inlineMath: (content) => `$${content}$`,
  inlineMathDouble: (content) => `$$${content}$$`,
  math: (content) => `\\[ ${content} \\]\n\n`
}

/* Stringify a Figure `node`. */
function math (ctx, node, index, parent) {
  let type = 'math'
  if (node.type === 'inlineMath') {
    try {
      const classes = node.data.hProperties.className
      type = classes.includes('math-display') ? 'inlineMathDouble' : 'inlineMath'
    } catch (e) {
      console.error(e, 'This rebber math plugin is only compatible with remark-math.')
    }
  }

  const macro = (has(ctx, 'math') && has(ctx.math, type) && ctx.math[type]) ||
    (has(defaultMacros, type) && defaultMacros[type])

  const content = all(ctx, node) || node.value || ''
  return macro(content.trim())
}
