/* Dependencies. */
const all = require('rebber/dist/all')

/* Expose. */
module.exports = customBlock

const defaultMacros = {
  defaultBlock: (environmentName, blockTitle, blockContent) => {
    return `\\begin{${environmentName}}${blockTitle ? `[{{${blockTitle}}}]` : ''}` +
      `\n${blockContent}` +
      `\n\\end{${environmentName}}\n`
  }
}

function customBlock (ctx, node) {
  const blockMacro = ctx[node.type] || defaultMacros[node.type] || defaultMacros.defaultBlock

  let blockTitle = ''
  if (node.children && node.children.length) {
    if (node.children[0].type.endsWith('CustomBlockHeading')) {
      const titleNode = node.children.splice(0, 1)[0]
      blockTitle = all(ctx, titleNode).trim()
    }
  }

  node.children[0].type = 'paragraph'

  const blockContent = all(ctx, node).trim()
  const options = ctx.customBlocks || {}

  let environmentName
  const type = node.type.replace('CustomBlock', '')

  if (options.map && options.map[type]) {
    environmentName = options.map[type]
  } else {
    environmentName = type[0].toUpperCase() + type.substring(1)
  }

  return blockMacro(environmentName, blockTitle, blockContent)
}
