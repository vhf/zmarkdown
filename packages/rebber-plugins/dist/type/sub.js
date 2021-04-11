"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = sub;
/* Stringify a sub `node`. */

function sub(ctx, node, index, parent) {
  const contents = all(ctx, node);
  return `\\textsubscript{${contents}}`;
}