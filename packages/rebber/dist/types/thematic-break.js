"use strict";

/* Expose. */
module.exports = thematicBreak;

const defaultMacro = () => '\\horizontalLine\n\n';
/* Stringify a delete `node`. */


function thematicBreak(ctx, node, index, parent) {
  const macro = ctx.thematicBreak || defaultMacro;
  return macro(node);
}