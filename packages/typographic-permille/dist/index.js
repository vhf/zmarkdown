"use strict";

const db = require('./db');

module.exports = (input = '', {
  locale
} = {}) => {
  const chars = {
    'PER MILLE SIGN': '\u2030'
  };
  const permillePattern = /%o/gim;
  const result = input.replace(permillePattern, chars['PER MILLE SIGN']);

  if (Object.keys(db).includes(locale)) {
    // If we need to replace space before per mille signs
    const spaceBeforePermillePattern = /( )(\u2030)/g;
    return result.replace(spaceBeforePermillePattern, `${db[locale]}$2`);
  }

  return result;
};