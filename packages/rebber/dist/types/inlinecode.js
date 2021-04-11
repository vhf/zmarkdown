"use strict";

const collapse = require('collapse-white-space');

const escape = require('../escaper');

module.exports = function inlineCode(ctx, node) {
  const finalCode = escape(collapse(node.value));
  return `\\texttt{${finalCode}}`;
};