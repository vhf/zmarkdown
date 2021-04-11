"use strict";

module.exports = (ctx, node, index, parent) => {
  const one = require('rebber/dist/one');

  if (ctx.tableHeader) {
    return ctx.tableHeader(node.value);
  }

  if (index === 0 && parent.children.length > 1) {
    // if we are on first header row we do not want to switch back to
    // font of normal serie
    return node.children.map((n, childIndex) => one(ctx, n, childIndex === 0 ? 0 : 2, node)).join('');
  }

  const parsed = node.children.map((n, childIndex) => one(ctx, n, index + childIndex, node));
  return parsed.join('');
};