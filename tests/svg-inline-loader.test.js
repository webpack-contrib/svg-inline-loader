var simpleHTMLTokenizer = require('simple-html-tokenizer');
var tokenize = simpleHTMLTokenizer.tokenize;
var generate = simpleHTMLTokenizer.generate;

var SVGInlineLoader = require('../index');
var assert = require('chai').assert;
var _ = require('lodash');

var svgWithRect = require('raw!./fixtures/xml-rect.svg');


describe('getExtractedSVG()', function(){
    var processedSVG = SVGInlineLoader.getExtractedSVG(svgWithRect);
    var reTokenized = tokenize(processedSVG);

    it('should remove width and height from <svg /> element', function () {
        reTokenized.forEach(function(tag) {
            if (SVGInlineLoader.conditions.isSVGToken(tag)) {
                tag.attributes.forEach(function (attributeToken) {
                    assert.isTrue(SVGInlineLoader.conditions.hasNoWidthHeight(attributeToken));
                });
            }
        });
    });

    it('should remove xml declaration', function () {
        assert.isFalse(reTokenized[0].tagName === 'xml');
    });

    it('should remove `<defs />` and its children if `removeTags` option is on', function () {
        var svgWithStyle = require('raw!./fixtures/style-inserted.svg');
        var processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { removeTags: true });
        var reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

        reTokenizedStyleInsertedSVG.forEach(function (tag) {
            assert.isTrue(tag.tagName !== 'style' &&
                          tag.tagName !== 'defs');
        });
    });

    it('should apply prefixes to class names', function () {
        var svgWithStyle = require('raw!./fixtures/style-inserted.svg');
        var processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { classPrefix: 'test.prefix-' });

        // Are all 10 classes prefixed in <style>
        assert.isTrue( processedStyleInsertedSVG.match(/\.test\.prefix-/g).length === 10 );
        // Is class attribute prefixed
        assert.isTrue( processedStyleInsertedSVG.match(/class="test\.prefix-/g).length === 1 );
    });

    it('should be able to specify tags to be removed by `removingTags` option', function () {
        var svgRemovingTags = require('raw!./fixtures/removing-tags.svg');
        var tobeRemoved = require('./fixtures/removing-tags-to-be-removed.json');
        var tobeRemain = require('./fixtures/removing-tags-to-be-remain.json');

        var processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgRemovingTags, { removeTags: true, removingTags: tobeRemoved });
        var reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

        reTokenizedStyleInsertedSVG.forEach(function (tag) {
            assert.isTrue(_.includes(tobeRemain, tag.tagName));
        });
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

    it('should be able to specify attributes to be removed by `removingTagAttrs` option', function () {
        var svgRemoveTagAttrs = require('raw!./fixtures/style-inserted.svg');
        var tobeRemoved = require('./fixtures/removing-attrs-to-be-removed.json');

        var processedSVG = SVGInlineLoader.getExtractedSVG(svgRemoveTagAttrs, { removingTagAttrs: tobeRemoved });
        var reTokenizedSVG = tokenize(processedSVG);

        reTokenizedSVG.forEach(function (tag) {
            if(tag.attributes) {
                tag.attributes.forEach(function(attr) {
                    assert.isFalse(_.includes(tobeRemoved, attr[0]));
                });
            }
        });
    });
});
