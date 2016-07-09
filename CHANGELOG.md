# Changelog

## 0.6.1

* Fixed a bug when using `removingTagAttrs`

## 0.6.0

* Added `classPrefix` option (by @kinetifex)

## 0.5.0

* Added `removingTagAttrs` option (by @iernie)

## 0.4.0

* Deprecated `<IconSVG />` and moved to another package ([`svg-inline-react`](https://github.com/sairion/svg-inline-react))

## 0.3.0

* Isolate transfomration functions and make tag removal optional, add README
* Added React svg icon tag

## 0.2.3

* Tag removal is fixed (`<defs />`, `<style />`, `<title />`, ...) and test added

## 0.2.2

* Added unittest

## 0.2.1

* Regex expanding self-closing tags added due to `simple-html-tokenizer`'s behavior (by @rondonjon)
* Added README and CHANGELOG

## 0.2.0

* Fixed Non-`<svg>` elements' width and height attributes gets removed
* Uses `simple-html-tokenizer` to tokenize html tags

## 0.1.0

* Initial implementation
