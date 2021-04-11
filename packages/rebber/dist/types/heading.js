"use strict";

/* Expose. */
module.exports = heading;
const defaultHeadings = [val => `\\part{${val}}\n`, val => `\\chapter{${val}}\n`, val => `\\section{${val}}\n`, val => `\\subsection{${val}}\n`, val => `\\subsubsection{${val}}\n`, val => `\\paragraph{${val}}\n`, val => `\\subparagaph{${val}}\n`];
/* Stringify a heading `node`.
 */

function heading(ctx, node) {
  const depth = node.depth;

  const content = require('../all')(ctx, node);

  const headings = ctx.headings || defaultHeadings;
  const fn = headings[node.depth - 1];

  if (typeof fn !== 'function') {
    throw new Error(`Cannot compile heading of depth ${depth}: not a function`);
  }

  return fn(content);
}