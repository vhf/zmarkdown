"use strict";

const db = require('./db');

module.exports = (input = '', {
  locale
} = {}) => {
  if (!Object.keys(db).includes(locale)) return input;
  const chars = db[locale];
  const leftMark = chars['LEFT-POINTING ANGLE QUOTATION MARK'];
  const rightMark = chars['RIGHT-POINTING ANGLE QUOTATION MARK'];
  const spaceChar = chars['NARROW NO-BREAK SPACE'];
  const leftAnglePattern = /<</gm;
  let result = input.replace(leftAnglePattern, leftMark);
  const leftAngleSpacePattern = new RegExp(`(${leftMark})(\\s)`, 'gm');
  result = result.replace(leftAngleSpacePattern, `$1${spaceChar}`);
  const rightAnglePattern = />>/gm;
  result = result.replace(rightAnglePattern, rightMark);
  const rightAngleSpacePattern = new RegExp(`(\\s)(${rightMark})`, 'gm');
  return result.replace(rightAngleSpacePattern, `${spaceChar}$2`);
};