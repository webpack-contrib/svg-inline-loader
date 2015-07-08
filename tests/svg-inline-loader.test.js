var simpleHTMLTokenizer = require('simple-html-tokenizer');
var tokenize = simpleHTMLTokenizer.tokenize;
var generate = simpleHTMLTokenizer.generate;

var SVGInlineLoader = require('../index');
var assert = require('chai').assert;

var svgWithRect = [
    '<?xml version="1.0"?>',
    '<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">',
    '    <rect x="10" y="50" width="100" height="200"/>',
    '</svg>'
].join('');

describe('getExtractedSVG()', function(){
    var processedSVG = SVGInlineLoader.getExtractedSVG(svgWithRect);
    var reTokenized = tokenize(processedSVG);

    it('should remove width and height from <svg /> element', function () {
        reTokenized.forEach(function(tag) {
            if (SVGInlineLoader.isSVGToken(tag)) {
                tag.attributes.forEach(function (attributeToken) {
                    assert.isTrue(SVGInlineLoader.hasNoWidthHeight(attributeToken));
                });
            }
        });
    });

    it('should remove xml declaration', function () {
        assert.isFalse(reTokenized[0].tagName === 'xml');
    });

    // TODO: after adopting object-returning tokenizer/parser, this needs to be cleaned-up.
    it('should not remove width/height from non-svg element', function () {
        reTokenized.forEach(function(tag) {
            if (tag.tagName === 'rect' && tag.type === 'StartTag') {
                tag.attributes.forEach(function (attributeToken) {
                    if (attributeToken[0] === 'x') {
                        assert.isTrue(attributeToken[1] === '10');
                    } else if (attributeToken[0] === 'y') {
                        assert.isTrue(attributeToken[1] === '50');
                    } else if (attributeToken[0] === 'width') {
                        assert.isTrue(attributeToken[1] === '100');
                    } else if (attributeToken[0] === 'height') {
                        assert.isTrue(attributeToken[1] === '200');
                    }
                });
            }
        });
    });

    // TODO: HTML allows some self-closing tags, needs to add spec
    it('should expand self-closing tag', function () {
        reTokenized.forEach(function(tag) {
            // simpleHTMLTokenizer sets `tag.selfClosing` prop undefined when it is a closing tag.
            if (tag.tagName === 'rect' &&
                typeof tag.selfClosing !== 'undefined') {
                assert.isFalse(tag.selfClosing)
            }
        });
    });
});
