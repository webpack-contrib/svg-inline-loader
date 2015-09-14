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

### query

There are a few queries available: `removeTags` (default: false), `removeSVGTagAttrs` (default: true), etc. (See `config.js`)

#### `removeTags`

Removes specified tags and its children. You can specify tags by setting `removingTags` query array. (i.e. `?removingTags[]=style`)

#### `removeSVGTagAttrs`

Removes `width` and `height` attributes from `<svg />`. Default is true.

## `<IconSVG />` React Component

To use this component in React, import/require from `svg-inline-loader/lib/component.jsx`.
It is ES5-safe, no need to transpile, You will need `object-assign` and `react` as dependencies.

Use like:

```jsx
<IconSVG src={require("svg-inline!icon.svg")} />
```

## Notes

[inspired by](https://gist.github.com/MoOx/1eb30eac43b2114de73a)
