# ZFM extension: Keyboard entries

## 0. Scope of this document

This document is part of the Zeste de Savoir Flavored Markdown specification, intended to be a collection of extensions to the well-known [Github Flavored Markdown][gfm].

## 1. Definitions

Is refered to as a pipe character the character `|` (U+007C), in it's unescaped version, that is, not precedeed by a backslash character `\` (U+005C).

A keyboard entry begins with an opening sequence of exactly two pipe characters, and ends with a closing sequence of exactly two pipe characters.

The contents of the keyboard entry are the characters between the two characters that are the closest in the opening and closing sequence, normalized by converting line endings to spaces.

This is a simple keyboard entry:

Example 1.1:

||Ctrl|| -> <p><kbd>Ctrl</kbd></p>

The following example shows an invalid keyboard entry:

Example 1.2:

||Ctrl| -> <p>||Ctrl|</p>

## 2. Pipe sequences

A keyboard entry can itself contain a pipe character.

Example 2.1:

||||| -> <p><kbd>|</kbd></p>

But not more than one, otherwise it might get confused with the closing sequence.

Example 2.2:

||a||b|| -> <p><kbd>a</kbd>b||</p>

No characters might be inserted between the two opening pipe characters.

Example 2.3:

| |a|| -> <p>| |a||</p>

No characters might be inserted between the two closing pipe characters.

Example 2.4:

||a| | -> <p>||a| |</p>

The inside of a keyboard entry cannot start or end with a space.

Example 2.5:

|| a|| -> <p>|| a||</p>

||a || -> <p>||a ||</p>

No keyboard entry can exist without content.

Example 2.6:

|||| -> <p>||||</p>

An backslash-escaped pipe cannot be used to make a keyboard entry:

Example 2.7:

\||a|| -> <p>||a||</p>

## 3. Precedence rules

Keyboard entry pipes have higher precedence than any other inline constructs except HTML tags and autolinks. Thus, for example, this is not parsed as emphasized text, since the second * is part of a keyboard entry:

Example 3.1:

*foo||*|| -> <p>*foo<kbd>*</kbd></p>

Keyboard entry cannot contain any other inline elements, such as emphasis, images, links, or anything.

Example 3.2:

||*foo*|| -> <p><kbd>*foo*</kbd></p>

[gfm]: https://github.github.com/gfm/