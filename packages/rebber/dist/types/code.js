'use strict';

/* Expose. */
module.exports = code;

var defaultMacro = function defaultMacro(content, lang) {
  var param = '';
  if (lang.indexOf('hl_lines=') > -1) {
    var lines = lang.split('hl_lines=')[1].trim();
    param += '[][' + lines + ']';
  }
  lang = lang.split(' ')[0];
  return '\\begin{codeBlock}' + param + '{' + lang + '}\n' + content + '\n\\end{codeBlock}\n\n';
};

/* Stringify a Blockquote `node`. */
function code(ctx, node) {
  var macro = ctx.code || defaultMacro;
  return macro(node.value, node.lang);
}