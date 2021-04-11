"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = notes;

const defaultMacro = (identifier, text, protect) => {
  const footnote = `\\footnote[${identifier}]{\\footnotemark{footnote:${identifier}} ${text}}`;

  if (protect) {
    return `${footnote}\\protect`;
  }

  return footnote;
};

function autoId(node) {
  const {
    line,
    column,
    offset
  } = node.position.start;
  return `l${line}c${column}o${offset}`;
}
/* Stringify a footnote `node`. */


function notes(ctx, node) {
  const macro = ctx.footnote || defaultMacro;
  const protect = !!node.inHeading;
  const identifier = autoId(node);
  return macro(identifier, all(ctx, node).trim(), protect);
}