export default {
  enter: {
    kbdCallString: enterKbdData
  },
  exit: {
    kbdCallString: exitKbdData
  }
}

function enterKbdData () {
  this.tag('<kbd>')
}

function exitKbdData () {
  this.tag('</kbd>')
}
