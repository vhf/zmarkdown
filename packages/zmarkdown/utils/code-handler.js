module.exports = code

const codeNodeConstructor = (lang, value) => {
  // no properties, except if a langage is specified
  // remark-highlight takes care of adding the right coloration
  const properties = {}
  if (lang) properties.className = [`language-${lang}`]

  // pre > code(.language-xxx)?
  return {
    type:       'element',
    tagName:    'pre',
    properties: {},
    children:   [{
      type:     'element',
      tagName:  'code',
      properties,
      children: [{
        type: 'text',
        value,
      }],
    }]}
}

// div.hljs-code-div
const parentDivConstructor = children => ({
  type:       'element',
  tagName:    'div',
  properties: {className: ['hljs-code-div']},
  children,
})

// div.hljs-line-numbers
const lineNumberDivConstructor = children => ({
  type:       'element',
  tagName:    'div',
  properties: {className: ['hljs-line-numbers']},
  children,
})

// span[data-count](.hll)?
const lineNumberElemConstructor = (count, hl) => {
  const properties = {'data-count': String(count)}
  if (hl) properties.className = 'hll'

  return {
    type:     'element',
    tagName:  'span',
    properties,
    children: [],
  }
}

// Parse ranges for hl_lines
const rangeHandler = range => {
  const fullRange = []

  for (const bit of range.split(' ')) {
    if (bit.match('-')) {
      const [rangeStart, rangeStop] = bit.split('-')

      const minLineNumber = parseInt(rangeStart)
      const maxLineNumber = parseInt(rangeStop)

      const rangeLength = (maxLineNumber - minLineNumber) + 1

      fullRange.push(...[...Array(rangeLength).keys()]
        .map(i => i + minLineNumber))
    } else {
      fullRange.push(parseInt(bit))
    }
  }

  return fullRange
}

function code (_, node) {
  const value = node.value ? `${node.value}\n` : ''
  const lang = (node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/)) || 'text'
  const attrs = node.meta

  const hlLines = rangeHandler(attrs.hlLines)

  const linesSplitted = value
    .split('\n')
    .slice(0, -1)

  const lineNumberElems = linesSplitted
    .map((_, i) => {
      const realLn = i + attrs.linenostart
      return lineNumberElemConstructor(realLn, hlLines.includes(realLn))
    })

  const parentDivChildren = []

  if (linesSplitted.length > 1) {
    parentDivChildren.push(lineNumberDivConstructor(lineNumberElems))
  }

  parentDivChildren.push(codeNodeConstructor(lang, value))

  return parentDivConstructor(parentDivChildren)
}
