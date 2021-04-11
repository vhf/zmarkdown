"use strict";

/* Dependencies. */
const one = require('./one');
/* Expose. */


module.exports = all;
/* Stringify all children of `parent`. */

function all(ctx, parent) {
  const children = parent && parent.children;
  if (!children) return '';
  return children.map((child, index) => one(ctx, child, index, parent)).join('');
}