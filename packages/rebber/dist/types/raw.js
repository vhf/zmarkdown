"use strict";

// TODO: make it customizable

/* Dependencies. */
const text = require('./text');
/* Expose. */


module.exports = raw;
/* Stringify `raw`. */

function raw(ctx, node) {
  return ctx.dangerous ? node.value : text(ctx, node);
}