import micromark from 'micromark'
import micromarkKbd from 'micromark-extension-kbd/lib/index.js'
import micromarkKbdHtml from 'micromark-extension-kbd/lib/html.js'

const renderString = (fixture) =>
  micromark(fixture, {
    extensions: [micromarkKbd()],
    htmlExtensions: [micromarkKbdHtml]
  })

const r = renderString('||a||b||')
console.log(r)
