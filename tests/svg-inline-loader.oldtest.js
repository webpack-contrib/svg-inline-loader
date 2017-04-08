const simpleHTMLTokenizer = require('simple-html-tokenizer');
const tokenize = simpleHTMLTokenizer.tokenize;

const SVGInlineLoader = require('../index');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const spies = require('chai-spies');
chai.use(spies);
const createSpy = chai.spy;
const _ = require('lodash');

const svgWithRect = require('raw!./fixtures/xml-rect.svg');


describe('getExtractedSVG()', () => {
  const processedSVG = SVGInlineLoader.getExtractedSVG(svgWithRect);
  const reTokenized = tokenize(processedSVG);

  it('should remove width and height from <svg /> element', () => {
    reTokenized.forEach((tag) => {
      if (SVGInlineLoader.conditions.isSVGToken(tag)) {
        tag.attributes.forEach((attributeToken) => {
          assert.isTrue(SVGInlineLoader.conditions.hasNoWidthHeight(attributeToken));
        });
      }
    });
  });

  it('should remove xml declaration', () => {
    assert.isFalse(reTokenized[0].tagName === 'xml');
  });

  it('should remove `<defs />` and its children if `removeTags` option is on', () => {
    const svgWithStyle = require('raw!./fixtures/style-inserted.svg');
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { removeTags: true });
    const reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

    reTokenizedStyleInsertedSVG.forEach((tag) => {
      assert.isTrue(tag.tagName !== 'style' &&
        tag.tagName !== 'defs');
    });
  });

  it('should apply prefixes to class names', () => {
    const svgWithStyle = require('raw!./fixtures/style-inserted.svg');
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { classPrefix: 'test.prefix-' });

    // Are all 10 classes prefixed in <style>
    assert.isTrue(processedStyleInsertedSVG.match(/\.test\.prefix-/g).length === 10);
    // Is class attribute prefixed
    assert.isTrue(processedStyleInsertedSVG.match(/class="test\.prefix-/g).length === 1);
  });

  it('should apply prefixes to ids', () => {
    const svgWithStyle = require('raw!./fixtures/with-ids.svg');
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { idPrefix: 'test.prefix-' });


    assert.isTrue(processedStyleInsertedSVG.match(/test\.prefix-foo/g).length === 3);
    // // replaces xlink:href=
    assert.isTrue(processedStyleInsertedSVG.match(/xlink:href=/g).length === 1);
    // // replaces url(#foo)
    assert.isTrue(processedStyleInsertedSVG.match(/url\(#test\.prefix-foo\)/g).length === 1);
  });

  it('should be able to specify tags to be removed by `removingTags` option', () => {
    const svgRemovingTags = require('raw!./fixtures/removing-tags.svg');
    const tobeRemoved = require('./fixtures/removing-tags-to-be-removed.json');
    const tobeRemain = require('./fixtures/removing-tags-to-be-remain.json');

    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgRemovingTags, { removeTags: true, removingTags: tobeRemoved });
    const reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

    reTokenizedStyleInsertedSVG.forEach((tag) => {
      assert.isTrue(_.includes(tobeRemain, tag.tagName));
    });
  });

  // TODO: after adopting object-returning tokenizer/parser, this needs to be cleaned-up.
  it('should not remove width/height from non-svg element', () => {
    reTokenized.forEach((tag) => {
      if (tag.tagName === 'rect' && tag.type === 'StartTag') {
        tag.attributes.forEach((attributeToken) => {
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
  it('should expand self-closing tag', () => {
    reTokenized.forEach((tag) => {
      // simpleHTMLTokenizer sets `tag.selfClosing` prop undefined when it is a closing tag.
      if (tag.tagName === 'rect' &&
        typeof tag.selfClosing !== 'undefined') {
        assert.isFalse(tag.selfClosing);
      }
    });
  });

  it('should be able to specify attributes to be removed by `removingTagAttrs` option', () => {
    const svgRemoveTagAttrs = require('raw!./fixtures/style-inserted.svg');
    const tobeRemoved = require('./fixtures/removing-attrs-to-be-removed.json');

    const processedSVG = SVGInlineLoader.getExtractedSVG(svgRemoveTagAttrs, { removingTagAttrs: tobeRemoved });
    const reTokenizedSVG = tokenize(processedSVG);

    reTokenizedSVG.forEach((tag) => {
      if (tag.attributes) {
        tag.attributes.forEach((attr) => {
          assert.isFalse(_.includes(tobeRemoved, attr[0]));
        });
      }
    });
  });
  it('should be able to warn about tagsAttrs to be removed listed in `warnTagAttrs` option via console.log', () => {
    const svg = require('raw!./fixtures/with-ids.svg');
    const tobeWarned = ['id'];
    const oldConsoleWarn = console.warn;
    const warnings = [];
    console.warn = createSpy((str) => {
      warnings.push(str);
    });
    const processedSVG = SVGInlineLoader.getExtractedSVG(svg, { warnTagAttrs: tobeWarned });
    const reTokenizedSVG = tokenize(processedSVG);
    expect(console.warn).to.have.been.called.with('svg-inline-loader: tag path has forbidden attrs: id');
    console.warn = oldConsoleWarn; // reset console back
  });

  it('should be able to specify tags to be warned about by `warnTags` option', () => {
    const svg = require('raw!./fixtures/removing-tags.svg');
    const tobeWarnedAbout = ['title', 'desc', 'defs', 'style', 'image'];
    const oldConsoleWarn = console.warn;
    const warnings = [];
    console.warn = createSpy((str) => {
      warnings.push(str);
    });
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svg, { warnTags: tobeWarnedAbout });
    const reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

    expect(console.warn).to.have.been.called();
    expect(console.warn).to.have.been.called.min(3);
    expect(console.warn).to.have.been.called.with('svg-inline-loader: forbidden tag style');
    console.warn = oldConsoleWarn; // reset console back
  });
});
