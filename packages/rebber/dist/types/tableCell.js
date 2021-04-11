"use strict";

/* Expose. */
module.exports = tableCell;

const defaultMacro = (ctx, node) => {
  return require('../all')(ctx, node);
};
/* Stringify a tableCell `node`. */


function tableCell(ctx, node) {
  const macro = ctx.tableCell || defaultMacro;
  return macro(ctx, node);
}