const gh = require('hast-util-sanitize/lib/github')
const katex = require('./katex')
const merge = require('deepmerge')

module.exports = merge.all([gh, katex, {
  tagNames: ['span', 'abbr', 'figure', 'figcaption', 'iframe'],
  attributes: {
    a: ['ariaHidden', 'class', 'className'],
    div: ['id', 'class', 'className'],
    span: ['id', 'data-count', 'class', 'className'],
    h1: ['ariaHidden'],
    h2: ['ariaHidden'],
    h3: ['ariaHidden'],
    abbr: ['title'],
    img: ['class'],
    code: ['className'],
    th: ['colspan', 'colSpan', 'rowSpan', 'rowspan'],
    td: ['colspan', 'colSpan', 'rowSpan', 'rowspan'],
    iframe: ['allowfullscreen', 'frameborder', 'height', 'src', 'width']
  },
  protocols: {
    href: ['ftp', 'dav', 'sftp', 'magnet', 'tftp', 'view-source'],
    src: ['ftp', 'dav', 'sftp', 'tftp']
  },
  clobberPrefix: '',
  clobber: []
}])
