"use strict";

/* Dependencies. */
const has = require('has');

const escape = require('../escaper');
/* Expose. */


module.exports = link;

const defaultMacro = (displayText, url, title) => `\\externalLink{${displayText}}{${url}}`;
/* Stringify a link `node`.
*/


function link(ctx, node) {
  if (!node.url) return '';
  const config = ctx.link || {};
  const macro = has(config, 'macro') ? config.macro : defaultMacro;
  const prefix = has(config, 'prefix') ? config.prefix : '';
  const url = escape(node.url.startsWith('/') ? prefix + node.url : node.url);
  return macro(require('../all')(ctx, node), url, node.title);
}