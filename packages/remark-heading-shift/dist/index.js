"use strict";

const visit = require('unist-util-visit');

function shifter(shift = 1) {
  return tree => {
    visit(tree, 'heading', function (node) {
      if (!shift) return;

      if (node.depth + shift <= 1) {
        node.depth = 1;
        return;
      }

      if (node.depth + shift >= 6) {
        node.depth = 6;
        return;
      }

      node.depth += shift;
    });
  };
}

module.exports = shifter;