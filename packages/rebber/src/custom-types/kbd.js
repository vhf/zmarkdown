/* Dependencies. */
const all = require('../all')

/* Expose. */
module.exports = kbd

/* Stringify a sub `node`. */
function kbd (ctx, node) {
  const contents = all(ctx, node)

  return `\\keys{${contents}}`
}
