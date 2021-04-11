"use strict";

module.exports = plugin;
/*
LaTeX requires special handlings of footnotes placed in headings such as \section{}
We therefore mark each footnote placed in heading for later handling.
*/

const nodeTypes = ['footnote', 'footnoteDefinition'];

function plugin() {
  return function headingVisitor(node, index, parent) {
    if (nodeTypes.includes(node.type) && node.inHeading !== true) {
      node.inHeading = true;
    }

    if (node.children) {
      node.children.forEach((n, i) => headingVisitor(n, i, node));
    }
  };
}