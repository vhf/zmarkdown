// A word of caution: this plugin is non-standard
// as regard to the MDAST specification.
// Indeed, it transforms `meta` from `string?`
// to `object` for code blocks.

// The goal of this plugin is to be able to parse
// meta information only once for HTML and LaTeX.

const visit = require('unist-util-visit')
const attrsParser = require('md-attr-parser')

module.exports = parseCodeMeta

function parseCodeMeta () {
  // Normalize ranges for hl_lines
  const rangeNormalize = range => {
    let normalizedRange = ''

    let previousNumber = -1
    let currentNumber = ''

    // Insert a number or range in the list
    function insert () {
      if (previousNumber >= 0) {
        const currentInt = parseInt(currentNumber)
        const previousInt = parseInt(previousNumber)

        const minLineNumber = Math.min(currentInt, previousInt)
        const maxLineNumber = Math.max(currentInt, previousInt)

        normalizedRange += `${minLineNumber}-${maxLineNumber} `
      } else {
        normalizedRange += `${parseInt(currentNumber)} `
      }
    }

    for (let charIndex = 0; charIndex < range.length; charIndex++) {
      const currentChar = range[charIndex]
      const currentCharCode = range.charCodeAt(charIndex)

      // Match 0-9
      if (currentCharCode >= 48 && currentCharCode <= 57) {
        currentNumber += currentChar
      } else if (currentChar === '-') {
        previousNumber = parseInt(currentNumber)
        currentNumber = ''
      } else if (currentChar === ' ' || currentChar === ',') {
        insert()

        previousNumber = -1
        currentNumber = ''
      }
    }

    // Parse the last property if any
    if (currentNumber) insert()

    return normalizedRange.trim()
  }

  return (tree) => {
    visit(tree, 'code', mutateCodeNode)
  }

  function mutateCodeNode (node) {
    const attrs = attrsParser(node.meta || '').prop

    const linenostart = parseInt(attrs.linenostart) || 1
    const hlLines = rangeNormalize(attrs.hl_lines || '')

    node.meta = { linenostart, hlLines }
  }
}
