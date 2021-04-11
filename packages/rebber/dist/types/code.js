"use strict";

/* Expose. */
module.exports = code;

const defaultMacro = (content, lang) => {
  // Default language is "text"
  if (!lang) lang = 'text';
  return `\\begin{CodeBlock}{${lang}}\n${content}\n\\end{CodeBlock}\n\n`;
};
/* Stringify a code `node`. */


function code(ctx, node) {
  const macro = ctx.code || defaultMacro;
  return `${macro(node.value, node.lang, node.meta)}`;
}

code.macro = defaultMacro;