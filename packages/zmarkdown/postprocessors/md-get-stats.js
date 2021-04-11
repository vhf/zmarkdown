const visit = require('unist-util-visit')

module.exports = () => (tree, vfile) => {
  let signs = 0
  let words = 0

  visit(tree, 'text', (node) => {
    let wordMatchFlag = false

    for (let i = 0; i < node.value.length; i++) {
      const currentCharCode = node.value.charCodeAt(i)

      if (
        // a-z
        (currentCharCode >= 65 && currentCharCode <= 90) ||
        // A-Z
        (currentCharCode >= 97 && currentCharCode <= 122) ||
        // 0-9
        (currentCharCode >= 48 && currentCharCode <= 57)
      ) {
        signs++
        wordMatchFlag = true
      } else if (currentCharCode === 32) {
        if (wordMatchFlag) words++
        signs++
        wordMatchFlag = false
      }
    }

    if (wordMatchFlag) words++
  })

  vfile.data.stats = {
    signs: signs,
    words: words
  }
}
