module.exports = () => {
  const state = {}

  return {
    definitionVisitor () {
      return (node, index, parent) => {
        let identifier = node.identifier
        while (Object.keys(state).includes(identifier)) {
          identifier += '-1'
        }

        state[identifier] = node.url
        node.identifier = identifier // force to remove twice so that latex compiles

        if (node.referenceType === 'shortcut') { // remark for abbr
          parent.children.splice(index, 1)
        }
      }
    },

    imageReferenceVisitor () {
      return (node) => {
        node.type = 'image'
        node.title = ''
        node.url = state[node.identifier]
      }
    },
    addIdentifier (identifier, content) {
      state[identifier] = content
    }
  }
}
