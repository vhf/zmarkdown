"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');

const clone = require('clone');
/* Expose. */


module.exports = appendixPlugin;

function definitionMacro(ctx, identifier, url) {
  return `\\label{${identifier}}${url}`;
}

function appendixPlugin(ctx, node) {
  if (node.children.length === 0) {
    return '';
  }

  const overriddenCtx = clone(ctx);
  overriddenCtx.definition = definitionMacro;
  const innerText = all(overriddenCtx, node);
  return `\\begin{appendices}\n${innerText.trimEnd()}\n\\end{appendices}`;
}