"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = sup;
/* Stringify a sup `node`. */

function sup(ctx, node, index, parent) {
  const contents = all(ctx, node);
  return `\\textsuperscript{${contents}}`;
}