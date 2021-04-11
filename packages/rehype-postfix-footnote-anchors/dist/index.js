"use strict";

const visit = require('unist-util-visit');

function findLastTag(node, tag = 'p') {
  if (!node.children || !node.children.length) return;
  const links = node.children.filter(e => e.tagName === tag);
  if (!links.length) return;
  return links[links.length - 1];
}

function findLastLink(node, className) {
  if (!node.children || !node.children.length) return;
  const links = node.children.filter(e => e.tagName === 'a');
  if (!links.length) return;
  const aTag = links[links.length - 1];
  if (!aTag.properties || !aTag.properties.className || !aTag.properties.className.includes(className)) return;
  return aTag;
}

function setPostfix(node, aTag, postfix) {
  if (typeof postfix === 'function') {
    const id = node.properties.id;
    node.properties.id = postfix(id);
    const link = aTag.properties.href;
    aTag.properties.href = `#${postfix(link.substr(1))}`;
  } else {
    node.properties.id += postfix;
    aTag.properties.href += postfix;
  }
}

function plugin(postfix = '-postfix') {
  return tree => {
    visit(tree, 'element', (node, index, parent) => {
      if (!['li', 'sup'].includes(node.tagName)) return;

      if (node.tagName === 'li') {
        if (!node.properties || !node.properties.id) return;
        if (!node.properties.id.startsWith('fn-')) return;
        if (!node.children.length) return;
        let aTag = findLastLink(node, 'footnote-backref');

        if (!aTag) {
          const pTag = findLastTag(node, 'p');
          aTag = findLastLink(pTag, 'footnote-backref');
        }

        if (!aTag) return;
        setPostfix(node, aTag, postfix);
      }

      if (node.tagName === 'sup') {
        if (!node.properties || !node.properties.id) return;
        if (!node.properties.id.startsWith('fnref-')) return;
        if (!node.children.length || node.children[0].tagName !== 'a') return;
        const aTag = node.children[0];
        if (!aTag.properties || !aTag.properties.className || !aTag.properties.className.includes('footnote-ref')) return;
        setPostfix(node, aTag, postfix);
      }
    });
  };
}

module.exports = plugin;