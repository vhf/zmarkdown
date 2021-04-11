"use strict";

/* Expose. */
module.exports = ping;
/* Stringify a `ping` node. */

function ping(_, node) {
  return `\\ping{${node.username}}`;
}