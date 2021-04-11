"use strict";

/* Dependencies. */
const has = require('has');

const xtend = require('xtend');
/* Expose. */


module.exports = encode;
encode.escape = escape;
/* List of enforced escapes. */

const defaultEscapes = {
  '#': '\\#',
  $: '\\$',
  '%': '\\%',
  '&': '\\&',
  '\\': '\\textbackslash{}',
  '^': '\\textasciicircum{}',
  _: '\\_',
  '{': '\\{',
  '}': '\\}',
  '~': '\\textasciitilde{}'
};
/* Encode special characters in `value`. */

function encode(value, opts = {}) {
  const escapes = xtend(defaultEscapes, opts);
  const set = toExpression(Object.keys(escapes));
  value = value.replace(set, function (char, pos, val) {
    return one(char, val.charAt(pos + 1), escapes);
  });
  return value;
}
/* Encode `char` according to `options`. */


function one(char, next, escapes) {
  if (has(escapes, char)) {
    return escapes[char];
  }

  return char;
}
/* Create an expression for `characters`. */


function toExpression(characters) {
  const pattern = characters.map(escapeRegExp).join('|');
  return new RegExp(`[${pattern}]`, 'g');
}

function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}