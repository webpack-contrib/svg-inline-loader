**NOTICE [2016-06-26]: I'm not using or developing this lib anymore. Therefore I'm closing issues (which I cannot handle anymore), but you can send PR to improve or fix problems you facing with this lib.**

# SVG Inline Loader for Webpack

This Webpack loader inlines SVG as module. If you use Adobe suite or Sketch to export SVGs, you will get auto-generated, unneeded crusts. This loader removes it for you, too.

## Config

Simply add configuration object to `module.loaders` like this.

```javascript
    {
        test: /\.svg$/,
        loader: 'svg-inline'
    }
```

warning: You should configure this loader only once via `module.loaders` or `require('!...')`. See [#15](https://github.com/sairion/svg-inline-loader/issues/15) for detail.

### query options

#### `removeTags: boolean`

Removes specified tags and its children. You can specify tags by setting `removingTags` query array.

default: `removeTags: false`

#### `removingTags: [...string]`

warning: this won't work unless you specify `removeTags: true`

default: `removingTags: ['title', 'desc', 'defs', 'style']`

#### `removeSVGTagAttrs: boolean`

Removes `width` and `height` attributes from `<svg />`.

default: `removeSVGTagAttrs: true`

#### `removingTagAttrs: [...string]`

Removes attributes from inside the `<svg />`.

default: `removingTagAttrs: []`

#### `classPrefix: boolean || string`

Adds a prefix to class names to avoid collision across svg files.

default: `classPrefix: false`

#### `idPrefix: boolean || string`

Adds a prefix to ids to avoid collision across svg files.

default: `idPrefix: false`


##### Example Usage
```js
// Using default hashed prefix (__[hash:base64:7]__)
var logoTwo = require('svg-inline?classPrefix!./logo_two.svg');

// Using custom string
var logoOne = require('svg-inline?classPrefix=my-prefix-!./logo_one.svg');

// Using custom string and hash
var logoThree = require('svg-inline?classPrefix=__prefix-[sha512:hash:hex:5]__!./logo_three.svg');
```
See [loader-utils](https://github.com/webpack/loader-utils#interpolatename) for hash options.

Preferred usage is via a `module.loaders`:
```js
    {
        test: /\.svg$/,
        loader: 'svg-inline?classPrefix'
    }
```

## Notes

- `<IconSVG />` React Component is **DEPRECATED**, use `svg-inline-react` package instead.
- Known problems:
  - currently inlining SVG in css is unable. See #22
