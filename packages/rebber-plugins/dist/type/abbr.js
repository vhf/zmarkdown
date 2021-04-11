"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = abbrPlugin;

function abbrPlugin(ctx, node) {
  const abbr = all(ctx, node);
  const reference = node.reference;

  if (ctx.abbr && typeof ctx.abbr === 'function') {
    return ctx.abbr(abbr, reference);
  }

  return `\\abbr{${abbr}}{${reference}}`;
}