# rebber-plugins [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status]


**rebber-plugins** is a collection of LaTeX stringifiers for custom [mdast][] nodes. These plugins are intended to be used with [rebber][].

It currently supports:

* [remark-abbr][]
* [remark-align][]
* [remark-custom-blocks][]
* [remark-emoticons][]
* [remark-grid-tables][]
* [remark-iframes][]
* [remark-kbd][]
* [remark-sub-super][]

## Installation

[npm][]:

```bash
npm install rebber-plugins
```

## Usage

```javascript
const unified = require('unified')
const remarkParser = require('remark-parse')
const rebber = require('rebber')

const {contents} = unified()
  .use(remarkParser, remarkConfig)
  .use(rebber, rebberConfig)
  .processSync('### foo')

console.log(contents);
```

## Supported remark plugins

###### [remark-abbr][]

* `remarkConfig` needs to be configured for `remark-abbr`
* `rebberConfig.overrides.abbr = require('rebber-plugins/dist/type/abbr')`
* `rebberConfig.abbr = (displayText, definition) => ''`


###### [remark-align][]

* `remarkConfig` needs to be configured for `remark-align`
* `rebberConfig.overrides.centerAligned = require('rebber-plugins/dist/type/align')`
* `rebberConfig.overrides.leftAligned = require('rebber-plugins/dist/type/align')`
* `rebberConfig.overrides.rightAligned = require('rebber-plugins/dist/type/align')`
* `rebberConfig.leftAligned = (innerText) => ''`
* `rebberConfig.centerAligned = (innerText) => ''`
* `rebberConfig.rightAligned = (innerText) => ''`
* `rebberConfig.defaultType = (innerText, type) => ''`


###### [remark-custom-blocks][]

* `remarkConfig` needs to be configured for `remark-custom-blocks`
* `rebberConfig.overrides.errorCustomBlock = require('rebber-plugins/dist/type/customBlocks')`
* `rebberConfig.errorCustomBlock = (innerText, environmentName) => ''`


###### [remark-emoticons][]

* `remarkConfig` needs to be configured for `remark-emoticons`
* `rebberConfig.overrides.emoticon = require('rebber-plugins/dist/type/emoticon')`
* `rebberConfig.emoticons = remarkConfig.emoticons`


###### [remark-grid-tables][]

* `remarkConfig` needs to be configured for `remark-grid-tables`
* `rebberConfig.overrides.gridTable = require('rebber-plugins/dist/type/gridTable')`


###### [remark-iframes][]

* `remarkConfig` needs to be configured for `remark-iframes`

`iframe` nodes require some preprocessing before getting compiled to LaTeX:

```javascript
const unified = require('unified')
const remarkParser = require('remark-parse')
const rebber = require('rebber')

const {contents} = unified()
  .use(remarkParser, {
    // see config options in the remark-iframes package
    iframes: {
      'www.dailymotion.com': {
        tag: 'iframe',
        width: 480,
        height: 270,
        disabled: false,
        replace: [
          ['video/', 'embed/video/'],
        ],
        thumbnail: {
          format: 'http://www.dailymotion.com/thumbnail/video/{id}',
          id: '.+/(.+)$'
        }
      },
    }
  })
  .use(rebber, {
    preprocessors: {
      iframe: require('rebber-plugins/dist/preprocessors/iframe')
    }
  })
  .processSync('some markdown')

console.log(contents);
```


###### [remark-kbd][]

* `remarkConfig` needs to be configured for `remark-kbd`
* `rebberConfig.overrides.kbd = require('rebber-plugins/dist/type/kbd')`


###### [remark-sub-super][]

* `remarkConfig` needs to be configured for `remark-sub-super`
* `rebberConfig.overrides.sub = require('rebber-plugins/dist/type/sub')`
* `rebberConfig.overrides.sup = require('rebber-plugins/dist/type/sup')`


## License

[MIT][license] © [Zeste de Savoir][zds]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/zestedesavoir/zmarkdown.svg

[build-status]: https://travis-ci.org/zestedesavoir/zmarkdown

[coverage-badge]: https://img.shields.io/coveralls/zestedesavoir/zmarkdown.svg

[coverage-status]: https://coveralls.io/github/zestedesavoir/zmarkdown

[license]: https://github.com/zestedesavoir/zmarkdown/blob/master/packages/rebber/LICENSE-MIT

[rebber]: https://github.com/zestedesavoir/zmarkdown/blob/master/packages/rebber

[rebber-plugins]: https://github.com/zestedesavoir/zmarkdown/blob/master/packages/rebber-plugins

[zds]: https://zestedesavoir.com

[npm]: https://www.npmjs.com/package/rebber

[mdast]: https://github.com/syntax-tree/mdast/blob/master/readme.md

[remark]: https://github.com/wooorm/remark

[rehype]: https://github.com/wooorm/rehype


[remark-abbr]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-abbr#remark-abbr--

[remark-align]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-align#remark-align--

[remark-captions]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-captions#remark-captions--

[remark-comments]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-comments#remark-comments--

[remark-custom-blocks]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-custom-blocks#remark-custom-blocks--

[remark-emoticons]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-emoticons#remark-emoticons--

[remark-escape-escaped]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-escape-escaped#remark-escape-escaped--

[remark-grid-tables]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-grid-tables#remark-grid-tables--

[remark-heading-shift]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-heading-shift#remark-heading-shift--

[remark-heading-trailing-spaces]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-heading-trailing-spaces#remark-heading-trailing-spaces--

[remark-iframes]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-iframes#remark-iframes--

[remark-kbd]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-kbd#remark-kbd--

[remark-numbered-footnotes]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-numbered-footnotes#remark-numbered-footnotes--

[remark-sub-super]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-sub-super#remark-sub-super--
