/* Dependencies. */
const all = require('rebber/dist/all')

/* Expose. */
module.exports = conclusion

const conclusionMacros = [
  content => `\\begin{LevelOneConclusion}\n${content}\n\\end{LevelOneConclusion}`,
  content => `\\begin{LevelTwoConclusion}\n${content}\n\\end{LevelTwoConclusion}`,
  content => `\\begin{LevelThreeConclusion}\n${content}\n\\end{LevelThreeConclusion}`
]

/* Stringify an conclusion `node`. */
function conclusion (ctx, node) {
  const level = node.data.level || 0
  const macro = ctx[node.type] || conclusionMacros[level]
  const innerText = all(ctx, node)

  return `${macro(innerText.trim())}\n\n`
}
