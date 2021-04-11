"use strict";

const has = require('has');

const defaultMacro = innerText => `\\item\\relax ${innerText}\n`;

const defaultCheckedMacro = innerText => `\\item[$\\boxtimes$]\\relax ${innerText}\n`;

const defaultUncheckedMacro = innerText => `\\item[$\\square$]\\relax ${innerText}\n`;

module.exports = listItem;

function listItem(ctx, node) {
  let rebberListItem = has(ctx, 'listItem') ? ctx.listItem : defaultMacro;

  if (node.checked === true) {
    rebberListItem = has(ctx, 'checkedListItem') ? ctx.checkedListItem : defaultCheckedMacro;
  } else if (node.checked === false) {
    rebberListItem = has(ctx, 'uncheckedListItem') ? ctx.uncheckedListItem : defaultUncheckedMacro;
  }

  return rebberListItem(require('../all')(ctx, node).trim());
}