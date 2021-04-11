"use strict";

const visit = require('unist-util-visit');

function plugin() {
  return transformer;
}

function transformer(tree) {
  visit(tree, 'paragraph', visitor);
}

function visitor(node, index, parent) {
  for (let c = 1; c < node.children.length - 1; c++) {
    const child = node.children[c];

    if (child.type === 'html') {
      const previousNode = node.children[c - 1];
      const nextNode = node.children[c + 1];

      if (previousNode.type === 'text' && previousNode.value.slice(-1) === '<' && nextNode.type === 'text' && nextNode.value[0] === '>') {
        previousNode.value += child.value;
        previousNode.value += nextNode.value;
        node.children.splice(c, 2);
        c -= 1;
      }
    }
  }
}

module.exports = plugin;