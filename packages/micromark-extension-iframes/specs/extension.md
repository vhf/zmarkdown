# ZFM extension: Embedded iframes

## 0. Scope of this document

This document is part of the Zeste de Savoir Flavored Markdown specification, intended to be a collection of extensions to the well-known [Github Flavored Markdown][gfm].

[gfm]: https://github.github.com/gfm/

## 1. Definitions

For the scope of this document, an exclamation mark character is defined as the character `!` (U+0021), in it's unescaped version, that is, not precedeed by a backslash character `\` (U+005C).

Similarly, we define an opening parenthesis as an unescaped `(` (U+0028) character, and a closing parenthesis as an `)` (U+0029) character (escaped or not, see example 3.4).

An iframe element consist of an opening sequence, followed by a valid URL, and ending with a closing character.

An opening sequence is defined as an exclamation mark character immediately followed by an opening parenthesis.

An URL is considered valid when it can be parsed by a standard parser as defined in the [WHATWG specification][whatwg-url].

[whatwg-url]: https://url.spec.whatwg.org/

For reference, this is an example of a simple iframe element, without too much overhead added on the HTML side:

Example 1.1:

!(https://www.youtube.com/watch?v=eLdiWe_HJv4) -> <iframe src="https://www.youtube.com/embed/eLdiWe_HJv4" frameborder="0" allowfullscreen></iframe>

The following example shows an invalid iframe element:

Example 1.2:

! (https://www.youtube.com/watch?v=eLdiWe_HJv4) -> <p>! (https://www.youtube.com/watch?v=eLdiWe_HJv4)</p>

## 2. Opening and closing sequences

An opening sequence must be started after two line breaks:

Example 2.1:

abab!(https://www.youtube.com/watch?v=eLdiWe_HJv4) -> <p>abab!(https://www.youtube.com/watch?v=eLdiWe_HJv4)</p>

Similarly, a closing sequence must end on two line breaks:

Example 2.2:

!(https://www.youtube.com/watch?v=eLdiWe_HJv4)ono -> <p>!(https://www.youtube.com/watch?v=eLdiWe_HJv4)ono</p>

Escaping either character of the opening sequence cancels the iframe, the backslash character is not rendered:

Example 2.3:

\\!(https://www.youtube.com/watch?v=eLdiWe_HJv4) -> <p>!(https://www.youtube.com/watch?v=eLdiWe_HJv4)</p>

Example 2.4:

!\\(https://www.youtube.com/watch?v=eLdiWe_HJv4) -> <p>!(https://www.youtube.com/watch?v=eLdiWe_HJv4)</p>

## 3. URLs

The URL cannot contain line breaks:

Example 3.1:

!(link
multilines) -> <p>!(link
multilines)</p>

A single URL, not enclosed between the opening and closing sequences, should not be parsed as an iframe:

Example 3.2:

http://jsfiddle.net/zgjhjv9j/ -> <p><a href="http://jsfiddle.net/zgjhjv9j/">http://jsfiddle.net/zgjhjv9j/</a></p>

The enclosed URL may not include closing parenthesis, even if backslash-escaped. In this case, the parser should end on the first encountered parenthesis:

Example 3.3:

!(https://www.youtube.com/watch?v=eLd)We_HJv4) -> <p>!(https://www.youtube.com/watch?v=eLd)We_HJv4)</p>

Example 3.4:

!(https://www.youtube.com/watch?v=eLd\\)We_HJv4) -> <p>!(https://www.youtube.com/watch?v=eLd\\)We_HJv4)</p>

However, the URL can contain percent-encoded closing parenthesis, as mentionned by the [specification][whatwg-url].

Therefore, no iframe shall be embedded inside another iframe:

Example 3.5:

!(https://www.youtube.com/watch?v=eLdWe_HJv4!(http://jsfiddle.net/zgjhjv9j/)) -> <p>!(https://www.youtube.com/watch?v=eLdWe_HJv4!(http://jsfiddle.net/zgjhjv9j/))</p>

## 4. Precedence rules

To broaden on the previous example, iframes are considered as leaf blocks according to the GFM specication, hence they cannot contain any other block.

Iframes do not have precedence over titles or code blocks, either indented or fenced. They do have precedence over all other block elements, including paragraphs, tables, block quotes, etc.

Example 4.1:

### !(https://www.youtube.com/watch?v=eLdWe_HJv4) -> <h3>!(https://www.youtube.com/watch?v=eLdWe_HJv4)</h3>

Example 4.2:

| foo | bar |
| --- | --- |
| baz | !(https://www.youtube.com/watch?v=eLdWe_HJv4) | -> <table>
<thead>
<tr>
<th>foo</th>
<th>bar</th>
</tr>
</thead>
<tbody>
<tr>
<td>baz</td>
<td><iframe src="https://www.youtube.com/embed/eLdiWe_HJv4" frameborder="0" allowfullscreen></iframe></td>
</tr>
</tbody>
</table>