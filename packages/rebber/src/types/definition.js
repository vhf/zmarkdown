module.exports = definition

const defaultMacro = (ctx, identifier, url, title) => {
  const node = {
    children: [{
      type: 'link',
      title: title,
      url: url,
      children: [{
        type: 'text',
        value: url
      }]
    }]
  }

  const link = require('../all')(ctx, node)

  return `\\footnote{\\label{${identifier}}${link}}`
}

function definition (ctx, node) {
  const macro = ctx.definition ? ctx.definition : defaultMacro
  return macro(ctx, node.identifier, node.url, node.title)
}
