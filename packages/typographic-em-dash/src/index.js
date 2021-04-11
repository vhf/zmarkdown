const db = require('./db')

module.exports = (input = '', { locale } = {}) => {
  // Replace -- by \u2013 for all locales
  const dashChar = '\u2014'
  const dashPattern = /--/gm
  let result = input.replace(dashPattern, `${dashChar}`)

  // nbsp inside em dash pairs
  // (foo -- bar -- baz. -> foo1—2bar2—1baz. where 1 is and 2 is nbsp
  if (Object.keys(db).includes(locale)) {
    const separation = new RegExp(`(^|\\s)(${dashChar})(\\s|$)`)
    const nnbs = db[locale]
    let temp = result
    let isOpening = true
    let startPosition = separation.exec(temp)
    result = ''
    while (startPosition) {
      result += temp.substring(0, startPosition.index)
      const replacement = isOpening ? `$1$2${nnbs}` : `${nnbs}$2$3`
      result += startPosition[0].replace(separation, replacement)
      temp = temp.substring(startPosition.index + startPosition[0].length, temp.length)
      startPosition = separation.exec(temp)
      isOpening = !isOpening
    }
    result += temp
  }

  return result
}
