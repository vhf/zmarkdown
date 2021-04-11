const db = require('./db')

module.exports = (input = '', { locale } = {}) => {
  if (!Object.keys(db).includes(locale)) return input

  const beforeSemiColon = db[locale]

  const pattern = / %(\s|$)/gim
  const handleSemiColon = (withSemiColon, afterSemiColon) =>
    `${beforeSemiColon}%${afterSemiColon}`

  return input.replace(pattern, handleSemiColon)
}
