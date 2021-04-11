const visit = require('unist-util-visit')

function findLastTag (node, tag = 'p') {
  if (!node.children || !node.children.length) return
  const links = node.children.filter(e => e.tagName === tag)
  if (!links.length) return
  return links[links.length - 1]
}
function findLastLink (node, className) {
  if (!node.children || !node.children.length) return
  const links = node.children.filter(e => e.tagName === 'a')
  if (!links.length) return
  const aTag = links[links.length - 1]
  if (!aTag.properties || !aTag.properties.className ||
    !aTag.properties.className.includes(className)) return
  return aTag
}

function plugin (title = '') {
  function transformer (tree) {
    visit(tree, 'element', visitor)
  }

  function visitor (node, index, parent) {
    if (node.tagName === 'li' && node.properties.id) {
      if (!node.children || !node.children.length) return
      let aTag = findLastLink(node, 'footnote-backref')

      if (!aTag) {
        const pTag = findLastTag(node, 'p')
        aTag = findLastLink(pTag, 'footnote-backref')
      }

      if (!aTag) return

      const identifier = node.properties.id.slice(3)
      const placeholderIndex = title.indexOf('$id')
      let thisTitle

      if (placeholderIndex !== -1) {
        thisTitle = title.split('')
        thisTitle.splice(placeholderIndex, 3, identifier)
        thisTitle = thisTitle.join('')
      }
      if (!thisTitle) thisTitle = identifier
      aTag.properties.title = thisTitle
    }
  }
  return transformer
}

module.exports = plugin
