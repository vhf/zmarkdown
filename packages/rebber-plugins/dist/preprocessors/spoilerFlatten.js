"use strict";

const visit = require('unist-util-visit');

module.exports = elemNames => (_, tree) => {
  // This should contain something like ['sCustomBlockBody', 'secretCustomBlockBody']
  const elemNamesBody = elemNames.map(v => v.concat('Body')); // Iterate over the elements to be flattened

  for (const elemNameBody of elemNamesBody) {
    visit(tree, elemNameBody, node => {
      // Recursive function that flattens all matching elements and keeps the others
      function flattenTree(blockTree) {
        return blockTree.map(v => {
          if (elemNames.includes(v.type)) {
            // Get sCustomBlock > sCustomBlockBody > *
            const newTree = v.children.filter(v => elemNamesBody.includes(v.type)) // This is sub-optimal, but flatMap doesn't have good support by now
            .reduce((acc, e) => acc.concat(e.children), []); // First level of recursion: on direct descendents

            return flattenTree(newTree);
          } else {
            // Second level of recursion: on indirect descendents
            if (v.children) {
              v.children = flattenTree(v.children);
            }

            return v;
          }
        }).reduce((acc, e) => acc.concat(e), []);
      } // First round on direct children


      node.children = flattenTree(node.children);
    });
  }
};