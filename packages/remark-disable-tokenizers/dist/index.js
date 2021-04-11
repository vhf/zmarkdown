"use strict";

const clone = require('clone');

const noop = () => false;

const noopLocator = () => -1;

const throwing = msg => () => {
  throw new Error(msg);
};

function plugin({
  block = [],
  inline = []
} = {}) {
  if (block.length) {
    block.filter(key => {
      if (Array.isArray(key)) return block.map(xs => xs[0]).includes(key[0]);
      return block.includes(key);
    }).forEach(key => {
      if (Array.isArray(key) && key.length === 2) {
        this.Parser.prototype.blockTokenizers[key[0]] = throwing(key[1]);
      } else {
        this.Parser.prototype.blockTokenizers[key] = noop;
      }
    });
  }

  if (inline.length) {
    inline.filter(key => {
      if (Array.isArray(key)) return inline.map(xs => xs[0]).includes(key[0]);
      return inline.includes(key);
    }).forEach(key => {
      let tokenizerName;
      let replacer;

      if (Array.isArray(key) && key.length === 2) {
        tokenizerName = key[0];
        replacer = throwing(key[1]);
      } else {
        tokenizerName = key;
        replacer = clone(noop);
      }

      if (this.Parser.prototype.inlineTokenizers[tokenizerName]) {
        Object.keys(this.Parser.prototype.inlineTokenizers[tokenizerName]).forEach(prop => {
          replacer[prop] = this.Parser.prototype.inlineTokenizers[tokenizerName][prop];
        });
      }

      this.Parser.prototype.inlineTokenizers[tokenizerName] = replacer;
      this.Parser.prototype.inlineTokenizers[tokenizerName].locator = noopLocator;
    });
  }
}

module.exports = plugin;