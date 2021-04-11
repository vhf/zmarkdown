"use strict";

module.exports = () => (node, index, parent) => {
  const linkNode = {
    type: 'link',
    url: node.data.hProperties.src,
    children: [{
      type: 'text',
      value: node.data.hProperties.src
    }]
  };
  const thumbnailNode = {
    type: 'image',
    url: node.data.thumbnail
  };

  if (parent.type !== 'figure') {
    const figureNode = {
      type: 'figure',
      children: [thumbnailNode, {
        type: 'figcaption',
        children: [linkNode]
      }]
    };
    parent.children[index] = figureNode;
  } else {
    parent.children[index] = thumbnailNode;
    parent.children[parent.children.length - 1].children.push(linkNode);
  }
};