"use strict";

/* Dependencies. */
const has = require('has');

const xtend = require('xtend');
/* Expose. */


module.exports = one;
/* Handlers. */

const handlers = {};
handlers.blockquote = require('./types/blockquote');
handlers.break = require('./types/break');
handlers.code = require('./types/code');
handlers.definition = require('./types/definition');
handlers.delete = require('./types/delete');
handlers.emphasis = require('./types/emphasis');
handlers.heading = require('./types/heading');
handlers.html = require('./types/html');
handlers.image = require('./types/image');
handlers.inlineCode = require('./types/inlinecode');
handlers.link = require('./types/link');
handlers.linkReference = require('./types/linkReference');
handlers.list = require('./types/list');
handlers.listItem = require('./types/listItem');
handlers.paragraph = require('./types/paragraph');
handlers.root = require('./types/root');
handlers.strong = require('./types/strong');
handlers.table = require('./types/table');
handlers.tableCell = require('./types/tableCell');
handlers.tableRow = require('./types/tableRow');
handlers.text = require('./types/text');
handlers.thematicBreak = require('./types/thematic-break');
/* Stringify `node`. */

function one(ctx, node, index, parent) {
  const handlersOverrides = has(ctx, 'overrides') ? ctx.overrides : {};
  const h = xtend(handlers, handlersOverrides);
  const type = node && node.type;

  if (!type) {
    throw new Error(`Received node '${node}' does not have a type.`);
  }

  if (!has(h, type) || typeof h[type] !== 'function') {
    throw new Error(`Cannot compile unknown node \`${type}\``);
  }

  return h[type](ctx, node, index, parent);
}