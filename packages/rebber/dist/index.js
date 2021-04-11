"use strict";

/* Dependencies. */
const xtend = require('xtend');

const definitions = require('mdast-util-definitions');

const one = require('./one');

const preprocess = require('./preprocessors');
/* Expose. */


module.exports = stringify;
module.exports.toLaTeX = toLaTeX;

function toLaTeX(tree, options = {}) {
  /* Stringify the given MDAST node. */
  preprocess(options, tree); // resolve definition after preprocess because this step can create new identifiers

  options.definitions = definitions(tree, options);
  return one(options, tree, undefined, undefined);
}
/* Compile MDAST tree using toLaTeX */


function stringify(config) {
  const settings = xtend(config, this.data('settings'));
  this.Compiler = compiler;

  function compiler(tree) {
    return toLaTeX(tree, settings, tree);
  }
}