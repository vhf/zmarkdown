"use strict";

/* Dependencies. */
const trimLines = require('trim-lines');

const escaper = require('../escaper');
/* Stringify a text `node`. */


module.exports = function text(ctx, node, index, parent) {
  const value = trimLines(node.value);
  return isLiteral(parent) ? value : escaper(value, ctx.escapes);
}; // TODO: `tagName` isn't part of MDAST!

/* Check if content of `node` should not be escaped. */


function isLiteral(node) {
  return node && (node.tagName === 'script' || node.tagName === 'style');
}