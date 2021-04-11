"use strict";

const clone = require('clone');

const visit = require('unist-util-visit');

const xtend = require('xtend');

const legendBlock = {
  table: 'Table:',
  code: 'Code:'
};
const internLegendBlock = {
  blockquote: 'Source:',
  image: 'Figure:'
};

function plugin(opts) {
  const externalBlocks = xtend(legendBlock, opts && opts.external || {});
  const internalBlocks = xtend(internLegendBlock, opts && opts.internal || {});
  const Compiler = this.Compiler;

  if (Compiler) {
    const visitors = Compiler.prototype.visitors;
    if (!visitors) return;

    visitors.figure = function (node) {
      const captionedNode = node.children[0];
      const captionNode = node.children[1];
      const captionedMarkdown = this.visit(captionedNode); // compile without taking care of the "figcaption" wrapper node

      const captionMarkdown = this.all(captionNode).join('');

      if (!(captionedNode.type in externalBlocks || captionedNode.type in internalBlocks)) {
        return captionedMarkdown;
      }

      let prefix = '';

      if (captionedNode.type in externalBlocks) {
        prefix = externalBlocks[captionedNode.type];
      } else if (captionedNode.type in internalBlocks) {
        prefix = internalBlocks[captionedNode.type];
      }

      return `${captionedMarkdown}\n${prefix} ${captionMarkdown}`;
    };
  }

  return function transformer(tree) {
    Object.keys(internalBlocks).forEach(nodeType => visit(tree, nodeType, internLegendVisitor(internalBlocks)));
    Object.keys(externalBlocks).forEach(nodeType => visit(tree, nodeType, externLegendVisitorCreator(externalBlocks)));
    visit(tree, 'figure', (figure, index, parent) => {
      if (parent.type === 'paragraph') {
        if (index === 0) {
          parent.type = figure.type;
          parent.data = figure.data;
          parent.children = figure.children;
          return;
        }

        parent.type = 'tempWrapper';
      }
    });
    visit(tree, 'tempWrapper', (wrapper, index, parent) => {
      const newChildren = [];
      wrapper.children.forEach((node, i) => {
        const child = clone(node);

        if (child.type === 'figure') {
          newChildren.push(child);
          return;
        }

        if (child.type === 'text' && !child.value.trim()) {
          return;
        } else if (child.type === 'text') {
          child.value = child.value.trim();
        }

        wrapper.children[i].type = 'paragraph';
        wrapper.children[i].children = [child];
        newChildren.push(wrapper.children[i]);
      });
      parent.children.splice(index, 1, ...newChildren);
    });
  };
}

function internLegendVisitor(internalBlocks) {
  return function (node, index, parent) {
    // if already wrapped in figure, skip
    if (parent && parent.type === 'figure') return; // if the current node has some children, the legend is the last child.
    // if not, the legend is the last child of the parent node.

    const lastP = node.children ? getLastParagraph(node.children) : parent; // legend can only be in a paragraph.

    if (!lastP || node.children && lastP.type !== 'paragraph' || !node.children && parent.type !== 'paragraph') {
      return;
    } // find which child contains the last legend


    let legendChildIndex = -1;
    lastP.children.forEach((child, index) => {
      if (child.type === 'text' && (child.value.startsWith(internalBlocks[node.type]) || child.value.includes(`\n${internalBlocks[node.type]}`))) {
        legendChildIndex = index;
      }
    });

    if (legendChildIndex === -1 || !node.children && legendChildIndex < index) {
      return;
    } // split the text node containing the last legend and find the line containing it


    const potentialLegendLines = lastP.children[legendChildIndex].value.split('\n');
    let lastLegendIndex = -1;
    potentialLegendLines.forEach((line, index) => {
      if (line.startsWith(internalBlocks[node.type])) {
        lastLegendIndex = index;
      }
    }); // the child containing the last legend is split in two: head contains text until
    // legend, tail contains legend text

    const tail = clone(lastP.children[legendChildIndex]);
    const headText = potentialLegendLines.slice(0, lastLegendIndex).join('\n'); // replace existing node 'head' content with text until legend

    lastP.children[legendChildIndex].value = headText; // legend text is put into the cloned node…

    const legendText = potentialLegendLines.slice(lastLegendIndex).join('\n').slice(internalBlocks[node.type].length).trimLeft();
    tail.value = legendText; // … and 'tail', the cloned node is inserted after 'head'

    lastP.children.splice(legendChildIndex + 1, 0, tail); // gather all nodes that should be inside the legend

    const legendNodes = lastP.children.slice(legendChildIndex + 1); // remove them from the parent paragraph

    lastP.children = lastP.children.slice(0, legendChildIndex + 1);
    const figcaption = {
      type: 'figcaption',
      children: legendNodes,
      data: {
        hName: 'figcaption'
      }
    };
    const figure = {
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
    if (index >= parent.children.length - 1) return;
    if (parent.children[index + 1].type !== 'paragraph') return;
    const legendNode = parent.children[index + 1];
    const firstChild = legendNode.children[0];
    if (firstChild.type !== 'text' || !firstChild.value.startsWith(blocks[node.type])) return;
    const legendNodes = [];
    const followingNodes = [];
    const firstTextLine = firstChild.value.replace(blocks[node.type], '').split('\n')[0];

    if (firstChild.value.includes('\n')) {
      followingNodes.push({
        type: 'text',
        value: firstChild.value.replace(blocks[node.type], '').split('\n')[1]
      });
    }

    legendNodes.push({
      type: 'text',
      value: firstTextLine.trimLeft() // remove the " " after the {prefix}:

    });
    legendNode.children.forEach((node, index) => {
      if (index === 0) return;

      if (node.type === 'text') {
        const keepInLegend = node.value.split('\n')[0];

        if (node.value.includes('\n')) {
          node.value = node.value.split('\n')[1];
          followingNodes.push(node);
        }

        legendNodes.push({
          type: 'text',
          value: keepInLegend
        });
      } else {
        legendNodes.push(clone(node));
      }
    });
    const figcaption = {
      type: 'figcaption',
      children: legendNodes,
      data: {
        hName: 'figcaption'
      }
    };
    const figure = {
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
      parent.children.splice(index + 1, 1, {
        type: 'paragraph',
        children: followingNodes
      });
    } else {
      parent.children.splice(index + 1, 1);
    }
  };
}

function getLastParagraph(xs, lastParagraph) {
  const len = xs.length;
  if (!len) return;
  const last = xs[len - 1];
  if (last.type === 'text') return lastParagraph;
  if (!last.children || !last.children.length) return lastParagraph;
  if (last.type === 'paragraph') return getLastParagraph(last.children, last);
  return getLastParagraph(last.children, lastParagraph);
}

module.exports = plugin;