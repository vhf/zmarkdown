const visit = require('unist-util-visit')

const helpMsg = `remark-ping: expected configuration to be passed: {
  pingUsername: (username) => bool,\n  userURL: (username) => string\n}`

module.exports = function plugin ({
  pingUsername,
  userURL,
  usernameRegex = /@(?:\*\*([^*]+)\*\*|(\w+))/
}) {
  if (typeof pingUsername !== 'function' || typeof userURL !== 'function') {
    throw new Error(helpMsg)
  }

  function inlineTokenizer (eat, value, silent) {
    const keep = usernameRegex.exec(value)
    if (!keep || keep.index > 0) return

    const total = keep[0]
    const username = keep[2] ? keep[2] : keep[1]

    if (pingUsername(username) === true) {
      const url = userURL(username)

      return eat(total)({
        type: 'ping',
        username: username,
        url: url,
        data: {
          hName: 'a',
          hProperties: {
            href: url,
            rel: 'nofollow',
            class: 'ping ping-link'
          }
        },
        children: [{
          type: 'text',
          value: '@'
        }, {
          type: 'emphasis',
          data: {
            hName: 'span',
            hProperties: {
              class: 'ping-username'
            }
          },
          children: [{
            type: 'text',
            value: username
          }]
        }]
      })
    } else {
      return eat(total[0])({
        type: 'text',
        value: total[0]
      })
    }
  }

  function locator (value, fromIndex) {
    const keep = usernameRegex.exec(value, fromIndex)
    if (keep) {
      return value.indexOf('@', keep.index)
    }
    return -1
  }

  inlineTokenizer.locator = locator

  const Parser = this.Parser

  // Inject inlineTokenizer
  const inlineTokenizers = Parser.prototype.inlineTokenizers
  const inlineMethods = Parser.prototype.inlineMethods
  inlineTokenizers.ping = inlineTokenizer
  inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'ping')

  const Compiler = this.Compiler

  // Stringify
  if (Compiler) {
    const visitors = Compiler.prototype.visitors
    visitors.ping = (node) => {
      if (!node.username.includes(' ')) {
        return `@${node.username}`
      }
      return `@**${node.username}**`
    }
  }

  return (tree, file) => {
    // mark pings in blockquotes, later on we'll need that info to avoid pinging from quotes
    visit(tree, 'blockquote', markInBlockquotes)
    // remove ping links from pings already in links
    visit(tree, 'link', (node) => {
      visit(node, 'ping', (ping, index) => {
        ping.data.hName = 'span'
        ping.data.hProperties = { class: 'ping ping-in-link' }
      })
    })
    visit(tree, 'ping', (node) => {
      if (!node.__inBlockquote) {
        if (!file.data[node.type]) {
          file.data[node.type] = []
        }
        // collect usernames to ping, they will be made available on the vfile
        // for some backend to act on
        file.data[node.type].push(node.username)
      }
    })
  }
}

function markInBlockquotes (node) {
  mark(node)

  if (node.children) {
    node.children.map((n, i) => markInBlockquotes(n))
  }
}

function mark (node) {
  if (node.type === 'ping') node.__inBlockquote = true
}
