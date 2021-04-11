"use strict";

/* Expose. */
module.exports = br;

const defaultMacro = () => ' \\\\\n';
/* Stringify a break `node`. */


function br(ctx, node) {
  const macro = ctx.break ? ctx.break : defaultMacro;
  return macro(node);
}