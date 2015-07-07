var simpleHTMLTokenizer = require('simple-html-tokenizer');
var tokenize = simpleHTMLTokenizer.tokenize;
var generate = simpleHTMLTokenizer.generate;

var SVGInlineLoader = require('../index');
var assert = require('chai').assert;

var svgWithRect =  '<?xml version="1.0"?>';
    svgWithRect += '<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">';
    svgWithRect += '<rect x="10" y="10" width="100" height="100"/>';
    svgWithRect += '</svg>';

describe('svg-inline-loader', function(){

    it('should remove width and height from svg element', function () {
        var processedSVG = SVGInlineLoader.getExtractedSVG(svgWithRect);
        var reTokenized = tokenize(processedSVG);

        reTokenized.forEach(function(tag) {
            if (SVGInlineLoader.isSVGToken(tag)) {
                tag.attributes.forEach(function (attributeToken) {
                    assert.isTrue(SVGInlineLoader.hasNoWidthHeight(attributeToken));
                });
            }
        });
    });
});
