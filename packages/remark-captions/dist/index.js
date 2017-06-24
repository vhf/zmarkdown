'use strict';

var clone = require('clone');
var visit = require('unist-util-visit');
var xtend = require('xtend');

var legendBlock = {
  table: 'Table:',
  code: 'Code:'
};

var internLegendBlock = {
  blockquote: 'Source:',
  img: 'Figure:'
};

function plugin(opts) {
  var externalBlocks = xtend(legendBlock, opts && opts.external || {});
  var internalBlocks = xtend(internLegendBlock, opts && opts.internal || {});

  return function transformer(tree) {
    Object.keys(internalBlocks).forEach(function (nodeType) {
      return visit(tree, nodeType, internLegendVisitor(internalBlocks));
    });

    Object.keys(externalBlocks).forEach(function (nodeType) {
      return visit(tree, nodeType, externLegendVisitorCreator(externalBlocks));
    });
  };
}

function internLegendVisitor(internalBlocks) {
  return function (node, index, parent) {

    // if already wrapped in figure, skip
    if (parent && parent.type === 'figure') return;

    // legend can only be in a paragraph
    var lastP = getLast(node.children);
    if (!lastP || lastP.type !== 'paragraph') return;

    // find which child contains the last legend
    var legendChildIndex = -1;
    lastP.children.forEach(function (child, index) {
      if (child.type === 'text' && child.value.includes('Source')) {
        legendChildIndex = index;
      }
    });
    if (legendChildIndex === -1) return;

    // split the text node containing the last legend and find the line containing it
    var potentialLegendLines = lastP.children[legendChildIndex].value.split('\n');
    var lastLegendIndex = -1;
    potentialLegendLines.forEach(function (line, index) {
      if (line.startsWith(internalBlocks[node.type])) {
        lastLegendIndex = index;
      }
    }

    // the child containing the last legend is split in two: head contains text until
    // legend, tail contains legend text
    );var tail = clone(lastP.children[legendChildIndex]);
    var headText = potentialLegendLines.slice(0, lastLegendIndex).join('\n'
    // replace existing node 'head' content with text until legend
    );lastP.children[legendChildIndex].value = headText;

    // legend text is put into the cloned node…
    var legendText = potentialLegendLines.slice(lastLegendIndex).join('\n').slice(internalBlocks[node.type].length).trimLeft();

    tail.value = legendText;
    // … and 'tail', the cloned node is inserted after 'head'
    lastP.children.splice(legendChildIndex + 1, 0, tail

    // gather all nodes that should be inside the legend
    );var legendNodes = lastP.children.slice(legendChildIndex + 1
    // remove them from the parent paragraph
    );lastP.children = lastP.children.slice(0, legendChildIndex + 1);

    var figcaption = {
      type: 'figcaption',
      children: legendNodes,
      data: {
        hName: 'figcaption'
      }
    };

    var figure = {
      type: 'figure',
      children: [clone(node), figcaption],
      data: {
        hName: 'figure'
      }
    };

    node.type = figure.type;
    node.children = figure.children;
    node.data = figure.data;
  };
}

function externLegendVisitorCreator(blocks) {
  return function (node, index, parent) {
    if (index + 1 < parent.children.length && parent.children[index + 1].type === 'paragraph') {
      var legendNode = parent.children[index + 1];
      var firstChild = legendNode.children[0];

      if (firstChild.value.startsWith(blocks[node.type])) {
        var legendNodes = [];
        var followingNodes = [];
        var firstTextLine = firstChild.value.replace(blocks[node.type], '').split('\n')[0];
        if (firstChild.value.includes('\n')) {
          followingNodes.push({ type: 'text',
            value: firstChild.value.replace(blocks[node.type], '').split('\n')[1] });
        }
        legendNodes.push({
          type: 'text',
          value: firstTextLine.trimLeft // remove the " " after the {prefix}:
          () });

        legendNode.children.forEach(function (node, index) {
          if (index === 0) return;
          if (node.type === 'text') {
            var keepInLegend = node.value.split('\n')[0];
            if (node.value.includes('\n')) {
              node.value = node.value.split('\n')[1];
              followingNodes.push(node);
            }
            legendNodes.push({ type: 'text', value: keepInLegend });
          } else {
            legendNodes.push(clone(node));
          }
        });

        var figcaption = {
          type: 'figcaption',
          children: legendNodes,
          data: {
            hName: 'figcaption'
          }
        };
        var figure = {
          type: 'figure',
          children: [clone(node), figcaption],
          data: {
            hName: 'figure'
          }
        };
        node.type = figure.type;
        node.children = figure.children;
        node.data = figure.data;
        if (followingNodes.length) {
          parent.children.splice(index + 1, 1, { type: 'paragraph', children: followingNodes });
        } else {
          parent.children.splice(index + 1, 1);
        }
      }
    }
  };
}

function getLast(xs) {
  var len = xs.length;
  if (!len) return;
  return xs[len - 1];
}

module.exports = plugin;