"use strict";

const clone = require('clone');

const visit = require('unist-util-visit');

module.exports = processQuizzFactory;

function processQuizzFactory(ctx) {
  const correctionTitle = ctx.correctionTitle || 'Correction';
  return (node, index, parent) => {
    if (node.children.length < 2 || !node.children[0].children || !node.children[1].children) {
      return;
    }

    node.type = 'neutralCustomBlock';
    const correction = clone(node);
    correction.type = 'sCustomBlock';
    correction.children[0].children[0].value = correctionTitle;
    parent.children.splice(index + 1, 0, correction);
    const bodyChildren = node.children[1].children;

    while (bodyChildren.length > 0 && bodyChildren[bodyChildren.length - 1].type !== 'list') {
      bodyChildren.splice(bodyChildren.length - 1, 1);
    }

    visit(node, 'listItem', itemNode => {
      itemNode.checked = null;
    });
  };
}