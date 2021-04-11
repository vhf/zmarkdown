"use strict";

const whitespace = require('is-whitespace-character');

const DEFAULT_LEFT = '|';
const DEFAULT_RIGHT = '|';

function plugin(config) {
  const CHAR_LEFT = config && config.charLeft || DEFAULT_LEFT;
  const CHAR_RIGHT = config && config.charRight || DEFAULT_RIGHT;
  const DOUBLE_LEFT = CHAR_LEFT + CHAR_LEFT;
  const DOUBLE_RIGHT = CHAR_RIGHT + CHAR_RIGHT;

  function locator(value, fromIndex) {
    const index = value.indexOf(DOUBLE_LEFT, fromIndex);
    return index;
  }

  function inlineTokenizer(eat, value, silent) {
    if (!this.options.gfm || value.substr(0, 2) !== DOUBLE_LEFT || value.substr(0, 4) === DOUBLE_LEFT + DOUBLE_RIGHT || whitespace(value.charAt(2))) {
      return;
    }

    let character = '';
    let previous = '';
    let preceding = '';
    let subvalue = '';
    let index = 1;
    const length = value.length;
    const now = eat.now();
    now.column += 2;
    now.offset += 2;

    while (++index < length) {
      character = value.charAt(index);

      if (character === CHAR_RIGHT && previous === CHAR_RIGHT && (!preceding || !whitespace(preceding))) {
        /* istanbul ignore if - never used (yet) */
        if (silent) return true;
        return eat(DOUBLE_LEFT + subvalue + DOUBLE_RIGHT)({
          type: 'kbd',
          children: this.tokenizeInline(subvalue, now),
          data: {
            hName: 'kbd'
          }
        });
      }

      subvalue += previous;
      preceding = previous;
      previous = character;
    }
  }

  inlineTokenizer.locator = locator;
  const Parser = this.Parser; // Inject inlineTokenizer

  const inlineTokenizers = Parser.prototype.inlineTokenizers;
  const inlineMethods = Parser.prototype.inlineMethods;
  inlineTokenizers.kbd = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'kbd');
  const Compiler = this.Compiler; // Stringify

  if (Compiler) {
    const visitors = Compiler.prototype.visitors;

    visitors.kbd = function (node) {
      return `${DOUBLE_LEFT}${this.all(node).join('')}${DOUBLE_RIGHT}`;
    };
  }
}

module.exports = plugin;