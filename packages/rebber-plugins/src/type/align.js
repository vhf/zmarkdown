/* Dependencies. */
const all = require('rebber/dist/all')

/* Expose. */
module.exports = align

const defaultMacros = {
  leftAligned: (innerText) => `\n\n${innerText}\n\n`,
  centerAligned: (innerText) => `\n{\\centering ${innerText}}\n`,
  rightAligned: (innerText) => `\n{\\raggedleft\n${innerText}}\n`,
  defaultType: (innerText, type) => `\n\\begin{${type}}\n${innerText}\n\\end{${type}}\n`
}

function align (ctx, node) {
  const macro = ctx[node.type] || defaultMacros[node.type] || defaultMacros.defaultType
  const innerText = all(ctx, node)
  return macro(innerText, node.type)
}
