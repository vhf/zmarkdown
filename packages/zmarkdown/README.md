# zmarkdown

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

This project is an **HTTP Server API** providing fast and extensible **markdown parser**. It is the Markdown engine powering [Zeste de Savoir][zds].

It is a small express server leveraging the [**remark**
processor][processor] and its [**MDAST**][mdast] syntax tree, [**rehype**][rehype] (for HTML processing) and [**textr**][textr] (text transformation framework). It also provides [**MDAST**][mdast] to LaTeX compilation via [**rebber**][rebber] (and its [plugins][rebber-plugins]).

```log
curl -H "Content-Type: application/json" -X POST -d '{"md":"Hello word"}' http://localhost:27272/html
#return: ["<p>Hello word</p>",{"disableToc":true,"languages":[],"depth":1},[]]
```

[npm-image]: https://img.shields.io/npm/v/zmarkdown.svg
[npm-url]: https://npmjs.org/package/zmarkdown
[downloads-image]: https://img.shields.io/npm/dm/zmarkdown.svg
[downloads-url]: https://npmjs.org/package/zmarkdown
[travis-image]: https://img.shields.io/travis/zestedesavoir/zmarkdown/master.svg?label=linux
[travis-url]: https://travis-ci.com/zestedesavoir/zmarkdown
[coveralls-image]: https://img.shields.io/coveralls/zestedesavoir/zmarkdown/master.svg
[coveralls-url]: https://coveralls.io/r/zestedesavoir/zmarkdown?branch=master

[zds]: https://zestedesavoir.com
[processor]: https://github.com/remarkjs/remark/blob/master/packages/remark
[mdast]: https://github.com/wooorm/mdast
[rehype]: https://github.com/rehypejs/rehype
[textr]: https://github.com/A/textr
[rebber]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/rebber#rebber--
[rebber-plugins]: https://github.com/zestedesavoir/zmarkdown/tree/master/packages/rebber-plugins#rebber-plugins--

## Features
 - Convert Markdown to HTML ;
 - Convert Markdown to EPUB compatible HTML ;
 - Convert Markdown to LaTeX ;
 - Convert Markdown to TEX file.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry][npm-url]. Install with npm:

```
npm install zmarkdown
```

## Getting started

 1. Start your zmarkdown server  `npm run server`
 2. Send a `POST` request to `http://localhost:27272/{endpoint}`
 
`pm2 monit`: provides a realtime dashboard that fits directly into your terminal, it is a [simple way to monitor][pm2-monit] the resource usage of you server.

[pm2-monit]:http://pm2.keymetrics.io/docs/usage/monitoring/

### Limit the resource usage of your server

You can change the number of threads (default: `3`) and the max-memory of each thread (default: `150M`) in your package.json at `scripts.server` :

```json
    "server": "pm2 start -f server/index.js -i 3 --max-memory-restart 150M",
```

## Requests
All endpoints respond to `HTTP POST`. The request body must be JSON with a required `md` key. An optional `opts` key can be provided, the value of which depends on the endpoint.

### URL

```
POST http://localhost:27272/{endpoint}
```

### Body

#### Required Body JSON Value

| Name | Type | Description |
| - | - | - |
| `md` | string | markdown source string. |

#### Optional Body JSON Value

| Name | Type | Description |
| - | - | - |
| `opts` | JSON | Options specific to this endpoint. This object is documented in the **Request** section of each endpoint. |

### Response

All endpoints return `[contents, metadata, messages]` as JSON.

| Name | Type | Description |
| - | - | - |
| `contents` | string | the rendered HTML or LaTeX. |
| `metadata` | object | depends on request options. This object is documented in the **Response** section of each endpoint. |
| `messages` | string[] | info/debug/errors from parsers, plugins, compilers, etc. |

Only `metadata` is described in the **Response** sections below.

# Endpoints 

[ref-epub]: #epub
[ref-html]: #html
[ref-latex]: #latex
[ref-tex]: #tex

## epub

Markdown to EPUB compatible HTML

### URL

```
POST http://localhost:27272/epub
```

### Request `opts` values

| Name | Type | Description |
| - | - | - |
| `opts.images_download_dir` | bool | [see `/latex`][ref-latex] |
| `opts.local_url_to_local_path` | string | [see `/latex`][ref-latex] |

### Response `metadata` values

| Name | Type | Description |
| - | - | - |
| `metadata.disableToc` | bool | Whether or not the input Markdown did **not** contain headings (`#`, `##`, …). This property is named that way because we use it to disable Table of Contents generation when no headings were found.<br>- `disableToc: true` means *no headings*<br>- `disableToc: false` means at least one *heading*. |

## html

Markdown to HTML

### URL

```
POST http://localhost:27272/html
```

### Request `opts` values

| Name | Type | Description |
| - | - | - |
| `opts.disable_ping` | bool | default: `false`, [pings][ping] won't get parsed. |
| `opts.disable_jsfiddle` | bool |  default: `false`, JSFiddle [iframes][iframes] are disabled. |
| `opts.inline` | bool | default: `false`, Only parse inline Markdown elements (such as links and emphasis, unlike lists and fenced code blocks). |
| `opts.stats` | bool | default: `false`, Will compute and return statistics about markdown text. |

### Response `metadata` values

| Name | Type | Description |
| - | - | - |
| `metadata.disableToc` | bool | Whether or not the input Markdown did **not** contain headings (`#`, `##`, …). This property is named that way because we use it to disable Table of Contents generation when no headings were found.<br>`disableToc: true` means *no headings*<br>`disableToc: false` means at least one *heading* |
| `metadata.ping` | string[] | undefined if `opts.disable_ping: true`<br>The list of nicknames returned by `remark-ping`. Can be used to send "ping" notifications to the corresponding users.<br>Note: this is fully customizable, `remark-ping` can validate potential *ping*s by any means, including sending an HTTP request (we recommend `HEAD`) to a REST API to make sure this username actually exists. |
| `metadata.languages` | string[] | A list of unique languages used in GitHub Flavoured Markdown fences with a flag. |
| `metadata.stats` | object | stats about the parsed text:<br>- `signs`: number of chars, spaces included.<br>- ` words`: number of words. |

### Example

Here is a quick example of the request to be made to the `http://localhost:27272/html` endpoint, using the software of your choice:

```json
{
	"md": "# Hello\n\nThis is @zmarkdown, a wonderful [Markdown](https://fr.wikipedia.org/wiki/Markdown) parser. You can **embed** code in it:\n\n```js\n\nconst zmd = require('zmarkdown/modules/common')\n\n\n\nconst globalParser = common(opts, processor)\n\n```\n\n- Oh wait, this is *Mise en abyme*, isn't it?\n\n- Of course it is, you @silly.\n\n- Silly, me? Let me remind you that the main usage of this module is to launch the server directly, not using this Node.js crap:\n\n```bash\n\nnpm -g install pm2 && npm install zmarkdown\ncd ./node_modules/zmarkdown && npm run server\n\n```\n\nNow you know how it works, at least for the API endpoint, but we do support a lot more syntax, if you want.",
	"opts": {
		"stats": true
	}
}
```

This request will trigger the following response from the server:

```json
[
  "<h3 id=\"hello\">Hello<a aria-hidden=\"true\" href=\"#hello\"><span class=\"icon icon-link\"></span></a></h3>\n<p>This is <a href=\"/membres/voir/zmarkdown/\" rel=\"nofollow\" class=\"ping ping-link\">@<span class=\"ping-username\">zmarkdown</span></a>, a wonderful <a href=\"https://fr.wikipedia.org/wiki/Markdown\">Markdown</a> parser. You can <strong>embed</strong> code in it:</p>\n<div class=\"hljs-code-div\"><div class=\"hljs-line-numbers\"><span></span><span></span><span></span><span></span><span></span></div><pre><code class=\"hljs language-js\"><span class=\"hljs-keyword\">const</span> zmd = <span class=\"hljs-built_in\">require</span>(<span class=\"hljs-string\">'zmarkdown/modules/common'</span>)\n\n\n\n<span class=\"hljs-keyword\">const</span> globalParser = common(opts, processor)\n</code></pre></div>\n<ul>\n<li>\n<p>Oh wait, this is <em>Mise en abyme</em>, isn’t it?</p>\n</li>\n<li>\n<p>Of course it is, you <a href=\"/membres/voir/silly/\" rel=\"nofollow\" class=\"ping ping-link\">@<span class=\"ping-username\">silly</span></a>.</p>\n</li>\n<li>\n<p>Silly, me? Let me remind you that the main usage of this module is to launch the server directly, not using this Node.js crap:</p>\n</li>\n</ul>\n<div class=\"hljs-code-div\"><div class=\"hljs-line-numbers\"><span></span><span></span></div><pre><code class=\"hljs language-bash\">npm -g install pm2 &#x26;&#x26; npm install zmarkdown\n<span class=\"hljs-built_in\">cd</span> ./node_modules/zmarkdown &#x26;&#x26; npm run server\n</code></pre></div>\n<p>Now you know how it works, at least for the API endpoint, but we do support a lot more syntax, if you want.</p>",
  {
    "ping": [
      "zmarkdown",
      "silly"
    ],
    "disableToc": false,
    "languages": [
      "js",
      "bash"
    ],
    "depth": 5,
    "stats": {
      "signs": 386,
      "words": 78
    }
  },
  []
]
```

## LaTeX

Markdown to LaTeX

### URL

```
POST http://localhost:27272/epub
```

### Request `opts` values

| Name | Type | Description |
| - | - | - |
| `opts.disable_images_download` | bool | Default: `false`, does not download images. |
| `opts.images_download_dir` | string | Where to download the images to. |
| `opts.images_download_default` | string | Default: `black.png`, image used when the distant image is not found. |
| `opts.local_url_to_local_path` | - | [see below](#optslocal_url_to_local_path) this table. |
| `opts.images_download_timeout` | number | Default: `5000` ms. HTTP request timeout for each image, in milliseconds. |
| `opts.disable_jsfiddle` | bool | [see `/html`][ref-html] |

### opts.local_url_to_local_path

 - \[from: string, to: string\], default: `<none>`

   If provided, local images referenced in Markdown source (such as `![](/img/example.png)`)
   will be copied to `images_download_dir` after replacing the string `from` with `to` using
   the following RegExp:

   ```js
   '/img/example.png'.replace(new RegExp(`^${from}`), to)
   ```

### Response `metadata` values

This endpoint only returns `{}` as metadata, i.e. an empty object.

## TeX

Markdown to TEX file

### URL

```
POST http://localhost:27272/latex-document
```

### Request required `opts` values

These values are **required**.

| Name | Type | Description |
| - | - | - |
| `opts.content_type` | string | (**required**) Will be interpolated in `\documentclass[${content_type}]{zmdocument}` |
| `opts.title` | string | (**required**) Will be interpolated in `\title{${title}}` |
| `opts.authors`, | string[] | (**required**) Will be interpolated in `\author{${authors.join(', ')}}` |
| `opts.license` | string | (**required**) E.g. `CC-BY-SA` will be displayed as-is, using `${license_directory}/by-sa.svg` as license icon with a link to `https://creativecommons.org/licenses/by-sa/4.0/legalcode` |
| `opts.license_directory` | string | (**required**) Path to the directory where CC license SVG icons are stored, see `license` above. |
| `opts.smileys_directory` | string | (**required**) Path to the directory where smileys are stored. |
  
### Request `opts` values

| Name | Type | Description |
| - | - | - |
| `opts.disable_images_download` | bool | [see `/latex`][ref-latex] |
| `opts.images_download_dir` | string | [see `/latex`][ref-latex] |
* `opts.images_download_default` | string | [see `/latex`][ref-latex] |
| `opts.local_url_to_local_path` | string | [see `/latex`][ref-latex] |
| `opts.disable_jsfiddle` | bool | [see `/html`][ref-html] |

### Response `metadata` values

This endpoint only returns `{}` as metadata, i.e. an empty object.

## Client Architecture

The architecture of the client is similar to `remark` or `Vue`. The *manager*, here `client/client.js`, exposes a global variable `ZMarkdown`. This *manager* doesn't work alone because it does not know how to convert the input to the desired output. Example, if you want to convert markdown to html, the *manager* doesn't know how to do this. It need modules to know how to do this.

### Manager

You need to add modules with `ZMarkdown.use(obj)` to manage rendering.

To convert a markdown string you should use `ZMarkdown.render(str, moduleName = defaultModule, cb = undefined)`:
- **str**: `string`, string to convert
- **moduleName**: `string`, name of the module you want to use. This parameter can be **omitted only** if you define a default module with `ZMarkdown.setDefaultModule` (you can reset default module with `ZMarkdown.resetDefaultModule`)
- **cb**: `function(err, vfile)`, called when process is done

This function returns a `Promise` if no callback specified.

`ZMarkdown` also has a `parse(moduleName)` function to get the MDAST tree and `getParser(moduleName)` to get the whole parser. This parameter can be **omitted only** if you define a default module with `ZMarkdown.setDefaultModule`.

### Module

A module is an object with the following properties:

- **name**: `string`, module name used to identify each module.
- **render**: `function(input, cb): void`, a function called by `ZMarkdown.render`. It returns a `Promise` if no callback specified.
- **parse**: `function(input): object`, gets MDAST tree.
- **getParser**: `function(): object`, gets the whole of parser.
- **initialize**: `function(config)`, configure the module with a custom configuration. You do not have to call this function if you want to use the default configuration.

### Tips

You can start a module with a base parser using `./common.js` (see `./modules/zhtml.js` for instance). The module exports a function that can take two optionals parameters:
- **opts**: an object that can have:
  - **remarkConfig**: `object`, your remark config (defaults to the configuration from `config/remark.js`).
  - **extraRemarkPlugins**: `Array<objects>`, remark plugins you want to add to the default parser (remark pipeline). The object should contain:
    - **obj**: `remark plugin`.
    - **option**: optional, plugin config.
- **processor**: `function(config)` (defaults to `getHTMLProcessor` of `./common.js`), processor function used to configure the remark pipeline for your output

### Module Example

```js
const common = require('zmarkdown/modules/common') /* zmarkdown common file */
const remarkToc = require('remark-toc')
const remark2rehype = require('remark-rehype')

const opts = {
  remarkConfig: undefined /* custom remark config, defaults to ./config/remark.js */,
  extraRemarkPlugins: [
    {
      obj: remarkToc,
      option: undefined /* remark plugin option, undefined or omit to not configure it */
    },
    …
  ],
}

const processor = (config) => {
  config.remarkConfig.noTypography = true

  return globalParser.zmdParser(config.remarkConfig, config.extraRemarkPlugins)
    .use(remark2rehype, config.remarkConfig.remark2rehype)
}

const globalParser = common(opts, processor)

export function render (input, cb) {
  return globalParser.render(input, cb)
}

export function parse (input) {
  return parser.parse(input)
}

export function getParser () {
  return parser
}

export const name = 'custom-html'
```

Modules need to be bundled, here is a webpack config for the previous example:

```js
const path = require('path')

const mode = process.env.NODE_ENV ? process.env.NODE_ENV : 'production'

module.exports = {
    mode,
    name: 'ZMarkdownCustomHTML', // name of process if you use parallel-webpack
    entry: ['./modules/custom-html'], // path to your module
    output: {
      path: path.resolve(__dirname, 'dist'), // destination folder
      filename: 'custom-html.js', // file name
      library: 'ZMarkdownCustomHTML', // Name of the object that will be available on the `window` global object
    },
    module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
            },
          },
        ],
    },
}
```

### Dev build

If you want to watch the local files while working zmarkdown, you can use `npm run watch:client`. Run the client by opening `./public/index.html`.

*Note: the current implementation (parallel-webpack) doesn't support hot-reload, you will have to manually refresh the webpage after each change*.

### Production build

To build for production, just run `npm run release`. Generated files are located in `./dist`.

[ping]: https://www.npmjs.com/package/remark-ping
[iframes]: https://www.npmjs.com/package/remark-iframes
