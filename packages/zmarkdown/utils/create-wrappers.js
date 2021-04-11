const assert = require('assert')

module.exports = createWrapper

const allowAll = () => true

function createWrapper (tagToWrap, wrapInTags, classes, filter = allowAll) {
  if (!Array.isArray(wrapInTags)) wrapInTags = [wrapInTags]
  if (!Array.isArray(classes)) classes = [classes]
  assert(
    wrapInTags.length === classes.length,
    'You should provide the same number of wrapInTags and classes'
  )

  const visitor = (node, index, parent) => {
    if (node.type === 'element' && node.tagName === tagToWrap) {
      if ((filter && filter(node)) && !node.__wrapped) {
        wrap({ wrapInTags, classes }, { node, index, parent })
      }
    }
  }

  return visitor
}

function wrap ({ wrapInTags, classes }, { node, index, parent }) {
  let wrapped = node
  for (let i = 0; i < wrapInTags.length; i++) {
    node.__wrapped = true
    wrapped = {
      type: 'element',
      tagName: wrapInTags[i] || 'div',
      properties: {
        class: classes[i] || []
      },
      children: [wrapped]
    }
  }
  parent.children.splice(index, 1, wrapped)
}
