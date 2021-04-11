"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = kbd;
/* Stringify a kbd `node`. */

function kbd(ctx, node) {
  const contents = all(ctx, node);
  return `\\keys{${contents}}`;
}