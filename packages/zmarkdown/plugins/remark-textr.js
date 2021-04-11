const visit = require('unist-util-visit')
const textr = require('textr')

module.exports = plugin

function plugin ({ plugins = [], options = {} } = {}) {
  let fn

  return function transformer (tree) {
    fn = plugins.reduce(
      (processor, p) => processor.use(typeof p === 'string' ? require(p) : p),
      textr(options)
    )

    visit(tree, 'text', visitor)
  }

  function visitor (node) {
    node.value = fn(node.value)
  }
}
