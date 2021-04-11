const assert = require('assert')
const escape = require('rebber/dist/escaper')

module.exports = opts => {
  const {
    disableToc = false,
    content_type: contentType,
    license_directory: licenseDirectory,
    license_url: licenseUrl,
    license_logo: licenseLogo,
    logo_directory: logoDirectory,
    content_logo: contentLogo,
    content_link: contentLink,
    editor_logo: editorLogo,
    editor_link: editorLink,
    smileys_directory: smileysDirectory,
    title,
    authors,
    license,
    latex
  } = opts
  // Required options
  assert(contentType, 'Error with argument: "contentType"')
  assert(title, 'Error with argument: "title"')
  assert(Array.isArray(authors), 'Error with argument: "authors"')
  assert(license, 'Error with argument: "license"')
  assert(licenseDirectory, 'Error with argument: "licenseDirectory"')
  assert(smileysDirectory, 'Error with argument: "smileysDirectory"')
  assert(latex, 'Error with argument: "latex"')

  const licenceLogoPath = licenseLogo ? `${licenseDirectory}/${licenseLogo}` : ''
  const licenseLine = `\\licence[${licenceLogoPath}]{${license}}{${licenseUrl || ''}}`

  // Optional arguments
  const extraHeaders = []
  if (logoDirectory && contentLogo) extraHeaders.push(`\\logo{${logoDirectory}/${contentLogo}}`)
  if (logoDirectory && editorLogo) extraHeaders.push(`\\editorLogo{${logoDirectory}/${editorLogo}}`)
  if (contentLink) extraHeaders.push(`\\tutoLink{${contentLink}}`)
  if (editorLink) extraHeaders.push(`\\editor{${editorLink}}`)

  return `\\documentclass[${contentType}]{zmdocument}

\\usepackage{blindtext}
\\title{${escape(title)}}
\\author{${escape(authors.join(', '))}}
${licenseLine}
${extraHeaders.join('\n')}
\\smileysPath{${smileysDirectory}}
\\makeglossaries

\\begin{document}
\\maketitle
${disableToc ? '' : '\\tableofcontents'}

${latex}
\\end{document}`
}
