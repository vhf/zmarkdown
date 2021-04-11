"use strict";

/* Dependencies. */
const has = require('has');
/* Expose. */


module.exports = emoticon;
/* Stringify an emoticon `node`. */

function emoticon(ctx, node) {
  const code = node.value;
  if (!ctx.emoticons.emoticons || !has(ctx.emoticons.emoticons, code)) return;
  return `\\smiley{${ctx.emoticons.emoticons[code]}}`;
}