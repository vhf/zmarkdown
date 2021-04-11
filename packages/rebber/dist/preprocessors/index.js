"use strict";

const xtend = require('xtend');

const visit = require('unist-util-visit');

const referenceVisitors = require('./referenceVisitors');

module.exports = preprocess;

function preprocess(ctx, tree) {
  const {
    definitionVisitor,
    imageReferenceVisitor
  } = referenceVisitors();
  const defaultVisitors = {
    definition: [definitionVisitor],
    imageReference: [imageReferenceVisitor]
  };
  const visitors = xtend(defaultVisitors, ctx.preprocessors || {});
  Object.keys(visitors).forEach(nodeType => {
    if (Array.isArray(visitors[nodeType])) {
      visitors[nodeType].forEach(visitor => visit(tree, nodeType, visitor(ctx, tree)));
    } else {
      visit(tree, nodeType, visitors[nodeType](ctx, tree));
    }
  });
}