"use strict";

/* Dependencies. */
const one = require('../one');
/* Expose. */


module.exports = root;
/* Stringify a text `node`. */

function root(ctx, node, _, parent) {
  const children = node.children;
  if (!children) return '';
  let previous;
  return children.reduce((output, child, index) => {
    if (previous) {
      if (child.type === previous.type && previous.type === 'list') {
        output += previous.ordered === child.ordered ? '\n\n\n' : '\n\n';
      } else if (previous.type === 'list' && child.type === 'code' && !child.lang) {
        output += '\n\n\n';
      } else {
        output += '\n\n';
      }
    }

    output += one(ctx, child, index, node, node);
    previous = child;
    return output;
  }, '');
}