# SVG Inline Loader for Webpack

This Webpack loader inlines SVG as module. ([inspired by](https://gist.github.com/MoOx/1eb30eac43b2114de73a)) If you use Adobe Illustrator or Sketch to export SVGs, you will get auto-generated, unneeded crusts. This loader removes it for you, too.

## Config

Simply add configuration object to module.loaders like this.

```javascript
    {
        test: /\.svg$/,
        loader: 'svg-inline'
    }
```

To use in React, make a svg-container component

```jsx
// Custom icon component for demonstration
var Icon = React.createClass({
    propTypes: {
        svg: React.PropTypes.string.isRequired,
    },
    render () {
        return (
            <i {...this.props}
               svg={null}
               dangerouslySetInnerHTML={{__html: this.props.svg}}>
            </i>
        );
    }
});

```

and use like:

```

<Icon svg={require('./icon.svg')} />

```