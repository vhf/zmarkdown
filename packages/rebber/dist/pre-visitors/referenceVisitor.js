'use strict';

module.exports = plugin;

var identifiers = {};

function plugin() {
  var ctx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return {
    definitionVisitor: definitionVisitor,
    imageReferenceVisitor: imageReferenceVisitor
  };
}

function definitionVisitor(node, index, parent) {
  var identifier = node.identifier;
  while (Object.keys(identifiers).includes(identifier)) {
    identifier += '-1';
  }

  identifiers[identifier] = node.url;
  node.identifier = identifier; // force to remove twice so that latex compiles

  if (node.referenceType === 'shortcut') {
    // remark for abbr
    parent.children.splice(index, 1);
  }
}

function imageReferenceVisitor(node) {
  node.type = 'image';
  node.title = '';
  node.url = identifiers[node.identifier];
}