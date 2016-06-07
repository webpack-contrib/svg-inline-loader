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

## Notes

- `<IconSVG />` React Component is **DEPRECATED**, use `svg-inline-react` package instead.
- Known problems:
  - currently inlining SVG in css is unable. See #22
