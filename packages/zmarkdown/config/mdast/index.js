module.exports = {
  parse: {
    gfm: true,
    commonmark: false,
    footnotes: true,
    pedantic: false,
    /* sets list of known blocks to nothing, otherwise <h3>hey</h3> would become
    &#x3C;h3>hey&#x3C;/h3> instead of <p>&#x3C;h3>hey&#x3C;/h3></p> */
    blocks: []
  },

  alignBlocks: {
    center: 'align-center',
    right: 'align-right'
  },

  captions: {
    external: {
      table: 'Table:',
      gridTable: 'Table:',
      code: 'Code:',
      math: 'Equation:',
      iframe: 'Video:'
    },
    internal: {
      math: 'Equation:',
      inlineMath: 'Equation:',
      image: 'Figure:'
    }
  },

  customBlocks: require('./custom-blocks'),

  disableTokenizers: {},

  emoticons: require('./emoticons'),

  escapeEscaped: ['&'],

  footnotes: {
    inlineNotes: true
  },

  headingShifter: 0,

  iframes: require('./iframes'),

  imagesDownload: require('./images-download'),

  math: {
    inlineMathDouble: true
  },

  ping: {
    pingUsername: (_username) => true,
    userURL: (username) => `/@${username}`,
    usernameRegex: /\B@(?:\*\*([^*]+)\*\*|(\w+))/
  },

  postProcessors: {
    detectQuizzes: true,
    getStats: true,
    limitDepth: 100,
    listLanguages: true,
    wrapIntroCcl: false
  },

  textr: require('./textr')
}
