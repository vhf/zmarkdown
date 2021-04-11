const visit = require('unist-util-visit')
const appendix = require('../type/appendix')

const defaultReferenceGenerator = (appendixIndex) => `Code appendice ${appendixIndex}`

module.exports = (ctx, tree) => {
  ctx.overrides.appendix = appendix
  return (node) => {
    let appendix = tree.children[tree.children.length - 1]
    if (!appendix || appendix.type !== 'appendix') {
      appendix = {
        type: 'appendix',
        children: []
      }
      tree.children.push(appendix)
    }
    let appendixIndex = appendix.children.length + 1
    visit(node, 'code', (innerNode, index, _parent) => {
      appendix.children.push({
        type: 'paragraph',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'definition',
                identifier: `appendix-${appendixIndex}`,
                url: `${ctx.codeAppendiceTitle || 'Appendix'} ${appendixIndex}`,
                referenceType: 'full'
              }
            ],
            depth: 1
          }
        ]
      })

      appendix.children.push(innerNode)

      const generator = ctx.appendiceReferenceGenerator || defaultReferenceGenerator

      const referenceNode = {
        type: 'linkReference',
        identifier: `appendix-${appendixIndex}`,
        children: [
          {
            type: 'text',
            value: generator(appendixIndex)
          }
        ]
      }
      _parent.children.splice(index, 1, referenceNode)
      appendixIndex++
    })
  }
}
