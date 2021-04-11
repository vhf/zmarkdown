"use strict";

const has = require('has');

module.exports = list;

const defaultMacro = (innerText, isOrdered) => {
  if (isOrdered) {
    return `\\begin{enumerate}\n${innerText}\\end{enumerate}\n`;
  } else {
    return `\\begin{itemize}\n${innerText}\\end{itemize}\n`;
  }
};

function list(ctx, node) {
  const rebberList = has(ctx, 'list') ? ctx.list : defaultMacro;

  const itemized = require('../all')(ctx, node);

  return rebberList(itemized, node.ordered);
}