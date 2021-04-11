const db = require('./db')

module.exports = (input = '', { locale } = {}) => {
  if (!Object.keys(db).includes(locale)) return input

  const beforeColon = db[locale]

  const pattern = / :(\s|$)/gim
  const handleColon = (withColon, afterColon) =>
    `${beforeColon}:${afterColon}`

  return input.replace(pattern, handleColon)
}
