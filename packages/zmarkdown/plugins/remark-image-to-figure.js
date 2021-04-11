const clone = require('clone')
const visit = require('unist-util-visit')

module.exports = plugin

function plugin () {
  return function transformer (tree) {
    visit(tree, 'image', imageToFigure)
  }
}

// when a block only contains an image with an `alt`, turn this image into
// a `figure` for which the caption is the content of the `alt` attribute
function imageToFigure (img, index, parent) {
  if (parent.children.length === 1 && parent.type === 'paragraph') {
    if (!img.alt) return

    const figureCaptionNode = {
      type: 'figcaption',
      children: [
        {
          type: 'text',
          value: img.alt
        }
      ],
      data: {
        hName: 'figcaption'
      }
    }
    parent.type = 'figure'
    parent.children = [clone(img), figureCaptionNode]
    parent.data = {
      hName: 'figure'
    }
  }
}
