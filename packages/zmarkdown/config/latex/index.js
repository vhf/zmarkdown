/* eslint-disable max-len */
const remarkConfig = require('../mdast')
const escape = require('rebber/dist/escaper')
const appendix = require('rebber-plugins/dist/preprocessors/codeVisitor')

const rebberConfig = {
  preprocessors: {
    tableCell: appendix,
    footnoteDefinition: [appendix],
    spoilerFlatten: require('rebber-plugins/dist/preprocessors/spoilerFlatten')([
      'sCustomBlock',
      'secretCustomBlock'
    ]),

    heading: require('rebber-plugins/dist/preprocessors/headingVisitor'),
    quizzCustomBlock: require('rebber-plugins/dist/preprocessors/prepareQuizz')
  },
  overrides: {
    abbr: require('rebber-plugins/dist/type/abbr'),
    comments: require('rebber-plugins/dist/type/comments'),
    conclusion: require('rebber-plugins/dist/type/conclusion'),
    emoticon: require('rebber-plugins/dist/type/emoticon'),
    figure: require('rebber-plugins/dist/type/figure'),
    gridTable: require('rebber-plugins/dist/type/gridTable'),
    inlineMath: require('rebber-plugins/dist/type/math'),
    introduction: require('rebber-plugins/dist/type/introduction'),
    kbd: require('rebber-plugins/dist/type/kbd'),
    math: require('rebber-plugins/dist/type/math'),
    ping: require('rebber-plugins/dist/type/ping'),
    sub: require('rebber-plugins/dist/type/sub'),
    sup: require('rebber-plugins/dist/type/sup'),
    tableHeader: require('rebber-plugins/dist/type/tableHeader'),

    footnote: require('rebber-plugins/dist/type/footnote'),
    footnoteDefinition: require('rebber-plugins/dist/type/footnoteDefinition'),
    footnoteReference: require('rebber-plugins/dist/type/footnoteReference'),

    centerAligned: require('rebber-plugins/dist/type/align'),
    leftAligned: require('rebber-plugins/dist/type/align'),
    rightAligned: require('rebber-plugins/dist/type/align'),

    errorCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
    informationCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
    neutralCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
    questionCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
    secretCustomBlock: require('rebber-plugins/dist/type/customBlocks'),
    warningCustomBlock: require('rebber-plugins/dist/type/customBlocks'),

    inlineCode: (ctx, node) => {
      const escaped = escape(node.value)
      return `\\CodeInline{${escaped}}`
    },
    iframe: (ctx, node) => {
      const alternative = node.data.hProperties.src.includes('jsfiddle') ? 'Code' : 'Video'
      const caption = node.caption || ''
      return `\\iframe{${node.data.hProperties.src}}[${alternative}][${caption}]`
    }
  },
  emoticons: {
    emoticons: Object.entries(remarkConfig.emoticons.emoticons).reduce((acc, [key, val]) => {
      acc[key] = val.substring(val.lastIndexOf('/') + 1)
      return acc
    }, {})
  },
  codeAppendiceTitle: 'Annexes',
  appendiceReferenceGenerator: (appendixIndex) => `Annexe de code ${appendixIndex}`,
  code: require('../../utils/latex-code'),
  customBlocks: {
    map: {
      error: 'Error',
      information: 'Information',
      question: 'Question',
      secret: 'Spoiler',
      warning: 'Warning',
      neutre: 'Neutral'
    }
  },
  link: {
    prefix: 'http://zestedesavoir.com'
  },
  image: {
    inlineImage: (node) => `\\inlineImage{${node.url}}`,
    image: (node) => `\\image{${node.url}}`
  },
  figure: {
    image: (_1, _2, caption, extra) => `\\image{${extra.url}}${caption ? `[${caption}]` : ''}\n`
  },
  headings: [
    (val) => `\\levelOneTitle{${val}}\n`,
    (val) => `\\levelTwoTitle{${val}}\n`,
    (val) => `\\levelThreeTitle{${val}}\n`,
    (val) => `\\levelFourTitle{${val}}\n`,
    (val) => `\\levelFiveTitle{${val}}\n`,
    (val) => `\\levelSixTitle{${val}}\n`,
    (val) => `\\levelSevenTitle{${val}}\n`
  ]
}

Object.assign(rebberConfig.overrides, {
  eCustomBlock: (ctx, node) => {
    node.type = 'errorCustomBlock'
    return rebberConfig.overrides.errorCustomBlock(ctx, node)
  },
  erreurCustomBlock: (ctx, node) => {
    node.type = 'errorCustomBlock'
    return rebberConfig.overrides.errorCustomBlock(ctx, node)
  },
  iCustomBlock: (ctx, node) => {
    node.type = 'informationCustomBlock'
    return rebberConfig.overrides.informationCustomBlock(ctx, node)
  },
  qCustomBlock: (ctx, node) => {
    node.type = 'questionCustomBlock'
    return rebberConfig.overrides.questionCustomBlock(ctx, node)
  },
  sCustomBlock: (ctx, node) => {
    node.type = 'secretCustomBlock'
    return rebberConfig.overrides.secretCustomBlock(ctx, node)
  },
  aCustomBlock: (ctx, node) => {
    node.type = 'warningCustomBlock'
    return rebberConfig.overrides.warningCustomBlock(ctx, node)
  },
  attentionCustomBlock: (ctx, node) => {
    node.type = 'warningCustomBlock'
    return rebberConfig.overrides.warningCustomBlock(ctx, node)
  },
  nCustomBlock: (ctx, node) => {
    node.type = 'neutralCustomBlock'
    return rebberConfig.overrides.neutralCustomBlock(ctx, node)
  },
  neutreCustomBlock: (ctx, node) => {
    node.type = 'neutralCustomBlock'
    return rebberConfig.overrides.neutralCustomBlock(ctx, node)
  }
})

module.exports = rebberConfig
