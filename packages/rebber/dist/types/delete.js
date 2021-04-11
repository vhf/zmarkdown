"use strict";

// TODO: make it customizable

/* Expose. */
module.exports = deleteNode;
/* Stringify a delete `node`. */

function deleteNode(ctx, node, index, parent) {
  const contents = require('../all')(ctx, node);

  return `\\sout{${contents}}`;
}