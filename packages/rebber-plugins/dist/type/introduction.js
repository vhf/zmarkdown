"use strict";

/* Dependencies. */
const all = require('rebber/dist/all');
/* Expose. */


module.exports = introduction;
const introductionMacros = [content => `\\begin{LevelOneIntroduction}\n${content}\n\\end{LevelOneIntroduction}`, content => `\\begin{LevelTwoIntroduction}\n${content}\n\\end{LevelTwoIntroduction}`, content => `\\begin{LevelThreeIntroduction}\n${content}\n\\end{LevelThreeIntroduction}`];
/* Stringify an introduction `node`. */

function introduction(ctx, node) {
  const level = node.data.level || 0;
  const macro = ctx[node.type] || introductionMacros[level];
  const innerText = all(ctx, node);
  return `${macro(innerText.trim())}\n\n`;
}