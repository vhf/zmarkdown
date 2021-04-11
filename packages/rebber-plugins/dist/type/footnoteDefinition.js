"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = notes;

const defaultMacro = (identifier, text, protect) => // eslint-disable-next-line max-len
`${protect ? '\\protect' : ''}\\footnotetext[${identifier}]{\\footnotemark{footnote:${identifier}} ${text}}`;

function notes(ctx, node) {
  const macro = ctx.footnoteDefinition || defaultMacro;
  const protect = Boolean(node.inHeading);
  return macro(node.identifier, all(ctx, node).trim(), protect);
}