"use strict";

/* Expose. */
module.exports = image;

const defaultInlineMatcher = (node, parent) => {
  return parent.type === 'paragraph' && parent.children.length - 1 || parent.type === 'heading';
};

const defaultMacro = node => {
  /*
  Note that MDAST `Image` nodes don't have a `width` property.
  You might still want to specify a width since \includegraphics handles it.
  */
  const width = node.width ? `[width=${node.width}]` : '';
  return `\\includegraphics${width}{${node.url}}`;
};

const defaultInline = defaultMacro;

function image(ctx, node, _, parent) {
  const options = ctx.image || {};
  /*
  LaTeX cannot handle remote images, only local ones.
  \includegraphics crashes with filenames that contain more than one `.`,
  the workaround is \includegraphics{/path/to/{image.foo}.jpg}
  */

  if (node.url) {
    const pathParts = node.url.split('/');
    const filename = pathParts.pop();

    if (filename.includes('.')) {
      const filenameParts = filename.split('.');
      const extension = filenameParts.pop();
      const basename = filenameParts.join('.');
      const safeBasename = basename.includes('.') ? `{${basename}}.${extension}` : `${basename}.${extension}`;
      pathParts.push(safeBasename);
      node.url = `${pathParts.join('/')}`;
    }
  }

  let macro = options.image ? options.image : defaultMacro;
  const inlineMatcher = options.inlineMatcher ? options.inlineMatcher : defaultInlineMatcher;

  if (inlineMatcher(node, parent)) {
    macro = options.inlineImage ? options.inlineImage : defaultInline;
  }

  return macro(node);
}