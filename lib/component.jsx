var React = require('react');
var assign = require('object-assign');


// Use like:
//
// <IconSVG src={require("svg-inline!icon.svg")} />
//
var IconSVG = React.createClass({
    getDefaultProps: function getDefaultProps() {
        return {
            elementName: 'i',
            defaultClassName: 'icon-svg'
        };
    },
    propTypes: {
        src: React.PropTypes.string.isRequired,
        elementName: React.PropTypes.string
    },
    render: function render() {
        var props = assign({}, this.props,
            {
                src: null,
                dangerouslySetInnerHTML: { __html: this.props.src },
                className: (typeof this.props.className === 'string') ? this.props.className + ' ' + this.props.defaultClassName :
                                                                        this.props.defaultClassName
            }
        );

        return React.createElement(this.props.elementName, props);
    }
});

module.exports = IconSVG;
