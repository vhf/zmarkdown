# `micromark-extension-kbd`

**[micromark][]** extension that parses custom Markdown syntax to handle
keyboard keys.
This syntax extension follows a [formal specification][spec];
to make it short, use two pipe cahracters (`||`) as opening and closing
delimiters.

This package provides the low-level modules for integrating with the micromark
tokenizer and the micromark HTML compiler.

## Install

[npm][]:

```sh
npm install micromark-extension-kbd
```

## API

### `html`

### `syntax(options?)`

> Note: `syntax` is the default export of this module, `html` is available at
> `micromark-extension-kbd/lib/html`.

Support custom syntax to handle keyboard keys.
The export of `syntax` is a function that can be called with options and returns
an extension for the micromark parser (to tokenize keyboard pipes; can be passed
in `extensions`).
The export of `html` is an extension for the default HTML compiler (to compile
as `<kbd>` elements; can be passed in `htmlExtensions`).

##### `options`

None for now, please come back later.

## License

[MIT][license] © [Zeste de Savoir][zds]

<!-- Definitions -->

[license]: LICENCE

[micromark]: https://github.com/micromark/micromark

[npm]: https://docs.npmjs.com/cli/install

[spec]: specs/extension.md

[zds]: https://zestedesavoir.com
