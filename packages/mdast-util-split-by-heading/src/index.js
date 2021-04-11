import visit from 'unist-util-visit'

module.exports = splitAtDepth

function splitAtDepth (tree, { splitDepth = 1 }) {
  const splitter = new Splitter(splitDepth)

  visit(tree, null, (node, index, parent) => splitter.visit(node, index, parent))

  return {
    introduction: splitter.introduction,
    trees: splitter.subTrees
  }
}

function newRootTree (children = []) {
  return {
    type: 'root',
    children
  }
}

class Splitter {
  constructor (depth = 1) {
    this.lastIndex = -1
    this.subTrees = []
    this.depth = depth
    this.introduction = newRootTree()
  }

  visit (node, index, parent) {
    if (!parent) {
      // we are at the root
      return
    }

    if (node.type === 'heading' && node.depth === this.depth) {
      this.lastIndex = index
      const subtree = {
        title: newRootTree(node),
        children: newRootTree()
      }
      this.subTrees.push(subtree)
    } else if (parent.type === 'root' && this.lastIndex === -1) {
      this.introduction.children.push(node)
    } else if (parent.type === 'root') {
      this.subTrees[this.subTrees.length - 1].children.children.push(node)
    }
  }
}
