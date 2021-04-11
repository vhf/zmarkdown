"use strict";

module.exports = linkReference;

const defaultMacro = (reference, inner) => `\\hyperref[${reference}]{${inner}}`;

function linkReference(ctx, node) {
  const macro = ctx.linkReference ? ctx.linkReference : defaultMacro;

  const innerText = require('../all')(ctx, node);

  if (!ctx.definitions(node.identifier)) return `[${innerText}]`;
  return macro(node.identifier, innerText);
}