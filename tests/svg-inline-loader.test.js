import simpleHTMLTokenizer from 'simple-html-tokenizer';
// import chai from 'chai';
// import spies from 'chai-spies';
import _ from 'lodash';
import rawLoader from 'raw-loader';
import SVGInlineLoader from '../src/index';

// const assert = chai.assert;
// const expect = chai.expect;
const tokenize = simpleHTMLTokenizer.tokenize;
// const createSpy = chai.spy;

// chai.use(spies);


// const warn = console.warn;
// console.warn = jest.fn();


describe('getExtractedSVG()', () => {
  const svgWithRect = rawLoader('./fixtures/xml-rect.svg');
  const processedSVG = SVGInlineLoader.getExtractedSVG(svgWithRect);
  const reTokenized = tokenize(processedSVG);

  test('should remove width and height from <svg /> element', () => {
    reTokenized.forEach((tag) => {
      if (SVGInlineLoader.conditions.isSVGToken(tag)) {
        tag.attributes.forEach((attributeToken) => {
          expect.isTrue(SVGInlineLoader.conditions.hasNoWidthHeight(attributeToken));
          // assert.isTrue(SVGInlineLoader.conditions.hasNoWidthHeight(attributeToken));
        });
      }
    });
  });

  test('should remove xml declaration', () => {
    expect.isFalse(reTokenized[0].tagName === 'xml');
  });

  test('should remove `<defs />` and its children if `removeTags` option is on', () => {
    const svgWithStyle = rawLoader('./fixtures/style-inserted.svg');
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { removeTags: true });
    const reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

    reTokenizedStyleInsertedSVG.forEach((tag) => {
      expect.isTrue(tag.tagName !== 'style' &&
        tag.tagName !== 'defs');
    });
  });

  test('should apply prefixes to class names', () => {
    const svgWithStyle = rawLoader('./fixtures/style-inserted.svg');
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { classPrefix: 'test.prefix-' });

    // Are all 10 classes prefixed in <style>
    expect.isTrue(processedStyleInsertedSVG.match(/\.test\.prefix-/g).length === 10);
    // Is class attribute prefixed
    expect.isTrue(processedStyleInsertedSVG.match(/class="test\.prefix-/g).length === 1);
  });

  it('should apply prefixes to ids', () => {
    const svgWithStyle = rawLoader('./fixtures/with-ids.svg');
    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgWithStyle, { idPrefix: 'test.prefix-' });


    expect.isTrue(processedStyleInsertedSVG.match(/test\.prefix-foo/g).length === 3);
    // // replaces xlink:href=
    expect.isTrue(processedStyleInsertedSVG.match(/xlink:href=/g).length === 1);
    // // replaces url(#foo)
    expect.isTrue(processedStyleInsertedSVG.match(/url\(#test\.prefix-foo\)/g).length === 1);
  });

  test('should be able to specify tags to be removed by `removingTags` option', () => {
    const svgRemovingTags = rawLoader('./fixtures/removing-tags.svg');
    const tobeRemoved = rawLoader('./fixtures/removing-tags-to-be-removed.json');
    const tobeRemain = rawLoader('./fixtures/removing-tags-to-be-remain.json');

    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svgRemovingTags, { removeTags: true, removingTags: tobeRemoved });
    const reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

    reTokenizedStyleInsertedSVG.forEach((tag) => {
      expect.isTrue(_.includes(tobeRemain, tag.tagName));
    });
  });

  // TODO: after adopting object-returning tokenizer/parser, this needs to be cleaned-up.
  test('should not remove width/height from non-svg element', () => {
    reTokenized.forEach((tag) => {
      if (tag.tagName === 'rect' && tag.type === 'StartTag') {
        tag.attributes.forEach((attributeToken) => {
          if (attributeToken[0] === 'x') {
            expect.isTrue(attributeToken[1] === '10');
          } else if (attributeToken[0] === 'y') {
            expect.isTrue(attributeToken[1] === '50');
          } else if (attributeToken[0] === 'width') {
            expect.isTrue(attributeToken[1] === '100');
          } else if (attributeToken[0] === 'height') {
            expect.isTrue(attributeToken[1] === '200');
          }
        });
      }
    });
  });

  // TODO: HTML allows some self-closing tags, needs to add spec
  test('should expand self-closing tag', () => {
    reTokenized.forEach((tag) => {
      // simpleHTMLTokenizer sets `tag.selfClosing` prop undefined when it is a closing tag.
      if (tag.tagName === 'rect' &&
        typeof tag.selfClosing !== 'undefined') {
        expect.isFalse(tag.selfClosing);
      }
    });
  });

  test('should be able to specify attributes to be removed by `removingTagAttrs` option', () => {
    const svgRemoveTagAttrs = rawLoader('./fixtures/style-inserted.svg');
    const tobeRemoved = rawLoader('./fixtures/removing-attrs-to-be-removed.json');

    const processedSVG = SVGInlineLoader.getExtractedSVG(svgRemoveTagAttrs, { removingTagAttrs: tobeRemoved });
    const reTokenizedSVG = tokenize(processedSVG);

    reTokenizedSVG.forEach((tag) => {
      if (tag.attributes) {
        tag.attributes.forEach((attr) => {
          expect.isFalse(_.includes(tobeRemoved, attr[0]));
        });
      }
    });
  });
  test('should be able to warn about tagsAttrs to be removed listed in `warnTagAttrs` option via console.log', () => {
    const warn = console.warn;
    console.warn = jest.fn();
    const svg = rawLoader('./fixtures/with-ids.svg');
    const tobeWarned = ['id'];
    // const oldConsoleWarn = console.warn;
    // const warnings = [];
    // console.warn = createSpy((str) => {
    //   warnings.push(str);
    // });
    const processedSVG = SVGInlineLoader.getExtractedSVG(svg, { warnTagAttrs: tobeWarned });
    const reTokenizedSVG = tokenize(processedSVG);
    // expect(console.warn).to.have.been.called.with('svg-inline-loader: tag path has forbidden attrs: id');
    expect(console.warn.mock.calls[0]).toBe('svg-inline-loader: tag path has forbidden attrs: id');
    console.warn = warn;
  });

  test('should be able to specify tags to be warned about by `warnTags` option', () => {
    const svg = rawLoader('./fixtures/removing-tags.svg');
    const tobeWarnedAbout = ['title', 'desc', 'defs', 'style', 'image'];
    // const oldConsoleWarn = console.warn;
    // const warnings = [];
    // console.warn = createSpy((str) => {
    //   warnings.push(str);
    // });

    const warn = console.warn;
    console.warn = jest.fn();

    const processedStyleInsertedSVG = SVGInlineLoader.getExtractedSVG(svg, { warnTags: tobeWarnedAbout });
    const reTokenizedStyleInsertedSVG = tokenize(processedStyleInsertedSVG);

    expect(console.warn).to.have.been.called();
    expect(console.warn).to.have.been.called.min(3);
    expect(console.warn).to.have.been.called.with('svg-inline-loader: forbidden tag style');
    // reset console back
    console.warn = warn;
    // console.warn = oldConsoleWarn;
  });
});
