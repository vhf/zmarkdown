"use strict";

/* Expose. */
module.exports = blockquote;

const defaultMacro = innerText => `\\begin{Quotation}\n${innerText}\n\\end{Quotation}\n\n`;
/* Stringify a Blockquote `node`. */


function blockquote(ctx, node) {
  const macro = ctx.blockquote || defaultMacro;

  const innerText = require('../all')(ctx, node);

  return macro(innerText.trim());
}