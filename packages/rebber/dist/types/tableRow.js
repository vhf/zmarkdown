"use strict";

/* Expose. */
const one = require('../one');

module.exports = tableRow;

const defaultMacro = (ctx, node) => {
  const parsed = [];
  node.children.map((n, index) => parsed.push(one(ctx, n, index, node)));
  const line = parsed.join(' & ');
  return `${line} \\\\ \\hline\n`;
};

const defaultFirstLineRowFont = '\\rowfont[c]{\\bfseries}';
const defaultOtherLineRowFont = '\\rowfont[l]{}';
/* Stringify a tableRow `node`. */

function tableRow(ctx, node, index) {
  const macro = ctx.tableRow || defaultMacro;
  const firstLineRowFont = ctx.firstLineRowFont || defaultFirstLineRowFont;
  const otherLineRowFont = ctx.otherLineRowFont || defaultOtherLineRowFont;

  if (index === 0) {
    return `${firstLineRowFont}\n${macro(ctx, node)}`;
  } else if (index === 1) {
    return `${otherLineRowFont}\n${macro(ctx, node)}`;
  } else {
    return macro(ctx, node);
  }
}