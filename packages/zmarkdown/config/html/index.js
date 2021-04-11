const shortid = require('shortid')

let currentFootnotePostfix = shortid.generate()

module.exports = {
  autolinkHeadings: {
    behaviour: 'append'
  },

  bridge: {
    allowDangerousHtml: true,
    handlers: {
      code: require('../../utils/code-handler')
    }
  },

  footnotesTitles: 'Retourner au texte de la note $id',

  highlight: {
    ignoreMissing: true,
    plainText: ['console'],
    aliases: { tex: ['latex'] }
  },

  sanitize: require('../sanitize'),

  postfixFootnotes: (agg) => `${agg}-${currentFootnotePostfix}`,

  _regenerateFootnotePostfix: () => {
    currentFootnotePostfix = shortid.generate()
  },

  postProcessors: {
    iframeWrappers: require('./iframe-wrappers'),
    footnotesReorder: true,
    wrapCode: true
  }
}
