# remark-custom-blocks [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]

This plugin parses custom Markdown syntax to create new custom blocks.
It adds new nodes types to the [mdast][mdast] produced by [remark][remark]:

* `{yourType}CustomBlock`

If you are using [rehype][rehype], the stringified HTML result will be `div`s with configurable CSS classes.

It is up to you to have CSS rules producing the desired result for these classes.

The goal is to let you create blocks or panels somewhat similar to [these](http://docdock.netlify.com/shortcodes/panel/).

Each custom block can specify CSS classes and whether users are allowed or required to add a custom title to the block.

Only inline Markdown will be parsed in titles.

## Installation

[npm][npm]:

```bash
npm install remark-custom-blocks
```

## Usage, Configuration, Syntax

#### Configuration:

The configuration object follows this pattern:

```
trigger: {
  classes: String, space-separated classes, optional, default: ''
  title: String, 'optional' | 'required', optional, default: custom titles not allowed
}
```

#### Dependencies:

```javascript
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const remarkCustomBlocks = require('remark-custom-blocks')
```

#### Usage:

```javascript
unified()
  .use(remarkParse)
  .use(remarkCustomBlocks, {
    foo: {
      classes: 'a-class another-class'
    },
    bar: {
      classes: 'something',
      title: 'optional'
    },
    qux: {
      classes: 'qux-block',
      title: 'required'
    },
    spoiler: {
      classes: 'spoiler-block',
      title: 'optional',
      details: true
    },
  })
  .use(remark2rehype)
  .use(stringify)
```

The sample configuration provided above would have the following effect:

1. Allows you to use the following Markdown syntax to create blocks:

    ```markdown
    [[foo]]
    | content

    [[bar]]
    | content

    [[bar | my **title**]]
    | content

    [[qux | my title]]
    | content

    [[spoiler | my title]]
    | content
    ```

    * Block `foo` cannot have a title, `[[foo | title]]` will not result in a block.
    * Block `bar` can have a title but does not need to.
    * Block `qux` requires a title, `[[qux]]` will not result in a block.

1. This Remark plugin would create [mdast][mdast] nodes for these two blocks, these nodes would be of type:

    * `fooCustomBlock`, content will be in `fooCustomBlockBlody`
    * `barCustomBlock`, content in `barCustomBlockBody`, optional title in `barCustomBlockHeading`
    * `quxCustomBlock`, content in `quxCustomBlockBody`, required title in `quxCustomBlockHeading`

1. If you're using [rehype][rehype], you will end up with these 4 `div`s and 1 `details`:

    ```html
    <div class="custom-block a-class another-class">
      <div class="custom-block-body"><p>content</p></div>
    </div>

    <div class="custom-block something">
      <div class="custom-block-body"><p>content</p></div>
    </div>

    <div class="custom-block something">
      <div class="custom-block-heading">my <strong>title</strong></div>
      <div class="custom-block-body"><p>content</p></div>
    </div>

    <div class="custom-block qux-block">
      <div class="custom-block-heading">my title</div>
      <div class="custom-block-body"><p>content</p></div>
    </div>

     <details class="custom-block spoiler-block">
      <summary class="custom-block-heading">my title</summary>
      <div class="custom-block-body"><p>content</p></div>
    </details>
   ```

## License

[MIT][license] © [Zeste de Savoir][zds]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/zestedesavoir/zmarkdown.svg

[build-status]: https://travis-ci.org/zestedesavoir/zmarkdown

[coverage-badge]: https://img.shields.io/coveralls/zestedesavoir/zmarkdown.svg

[coverage-status]: https://coveralls.io/github/zestedesavoir/zmarkdown

[license]: https://github.com/zestedesavoir/zmarkdown/blob/master/packages/remark-custom-blocks/LICENSE-MIT

[zds]: https://zestedesavoir.com

[npm]: https://www.npmjs.com/package/remark-custom-blocks

[mdast]: https://github.com/syntax-tree/mdast/blob/master/readme.md

[remark]: https://github.com/wooorm/remark

[rehype]: https://github.com/wooorm/rehype
