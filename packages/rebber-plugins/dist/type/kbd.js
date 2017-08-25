'use strict';

/* Dependencies. */
var all = require('rebber/dist/all');

/* Expose. */
module.exports = kbd;

/* Stringify a sub `node`. */
function kbd(ctx, node) {
  var contents = all(ctx, node);

  return '\\keys{' + contents + '}';
}