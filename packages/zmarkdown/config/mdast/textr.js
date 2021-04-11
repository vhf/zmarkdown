const textrModules = {
  apostrophes: require('typographic-apostrophes'),
  apostrophesForPlurals: require('typographic-apostrophes-for-possessive-plurals'),
  copyright: require('typographic-copyright'),
  ellipses: require('typographic-ellipses'),
  emDashes: require('typographic-em-dashes'),
  enDashes: require('typographic-en-dashes'),
  registeredTrademark: require('typographic-registered-trademark'),
  singleSpaces: require('typographic-single-spaces'),
  trademark: require('typographic-trademark'),
  colon: require('typographic-colon/src'),
  emDash: require('typographic-em-dash/src'),
  exclamationMark: require('typographic-exclamation-mark/src'),
  guillemets: require('typographic-guillemets/src'),
  percent: require('typographic-percent/src'),
  permille: require('typographic-permille/src'),
  questionMark: require('typographic-question-mark/src'),
  semicolon: require('typographic-semicolon/src')
}

module.exports = {
  plugins: Object.values(textrModules),
  options: { locale: 'fr' }
}
