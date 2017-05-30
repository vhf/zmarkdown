const C_NEWLINE = '\n'
const C_NEWPARAGRAPH = '\n\n'

module.exports = function alignPlugin () {
  const regex = new RegExp(`->(.+)`)
  const endMarkers = ['->', '<-']

  function alignTokenizer (eat, value, silent) {
    const now = eat.now()
    const keep = regex.exec(value)
    if (!keep) return
    if (keep.index !== 0) return

    /* istanbul ignore if - never used (yet) */
    if (silent) return true

    let idx = 0
    let linesToEat = []
    const finishedBlocks = []
    let endMarker = ''
    let canEatLine = true
    while (canEatLine) {
      const next = value.indexOf(C_NEWLINE, idx + 1)
      const lineToEat = next !== -1 ? value.slice(idx, next) : value.slice(idx)
      linesToEat.push(lineToEat)

      if (lineToEat.length > 2 && endMarkers.indexOf(lineToEat.slice(-2)) !== -1) {
        if (endMarker === '') endMarker = lineToEat.slice(-2)
        if (lineToEat.slice(-2) !== endMarker) break
        else {
          finishedBlocks.push(linesToEat.join(C_NEWLINE))
          // Check if another block is following
          if (value.indexOf('->', next) !== (next + 1)) break
          else linesToEat = []
        }
      }

      idx = next + 1
      canEatLine = next !== -1
    }

    if (finishedBlocks.length === 0) return
    let stringToEat = ''
    finishedBlocks.forEach(function (block) {
      const contentBlock = block.slice(2, -2)
      if (contentBlock.length > 0) {
        stringToEat += block.slice(2, -2) + C_NEWPARAGRAPH
      }
    })

    const add = eat(finishedBlocks.join(C_NEWLINE))
    const exit = this.enterBlock()
    const contents = this.tokenizeBlock(stringToEat, now)
    exit()

    const type = endMarker === '->' ? 'align-right' : 'align-center'
    return add({
      type: type,
      children: contents,
      data: {
        hName: 'div',
        hProperties: {
          class: type
        }
      }
    })
  }

  const Parser = this.Parser

  // Inject blockTokenizer
  const blockTokenizers = Parser.prototype.blockTokenizers
  const blockMethods = Parser.prototype.blockMethods
  blockTokenizers.align_blocks = alignTokenizer
  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, 'align_blocks')
}
