var simpleHTMLTokenizer = require('simple-html-tokenizer');
var tokenize = simpleHTMLTokenizer.tokenize;
var generate = simpleHTMLTokenizer.generate;

function hasNoWidthHeight (attributeToken) {
    return attributeToken[0] !== 'width' && attributeToken[0] !== 'height';
}

function isSVGToken (tag) {
    return tag.type === 'StartTag' && tag.tagName === 'svg';
}

function getExtractedSVG (svgStr) {
    // Clean-up XML crusts like comments and doctype, etc.
    var svg = null;
    var cleanedUp = svgStr.replace(/<\?xml[\s\S]*?>/gi, "")
                          .replace(/<!doctype[\s\S]*?>/gi, "")
                          .replace(/<!--[\s\S]*?-->/g, "")
                          .trim();

    // Tokenize and filter attributes.
    // Currently, this removes width and height attributes from <svg />.
    try {
        var tokens = tokenize(cleanedUp);
    } catch (e) {
        console.warn('svg-inline-loader: Tokenization has failed, please check SVG is correct.');
        svg = cleanedUp;
    }
    // If tokenization has failed, return earlier with cleaned-up string
    if (svg !== null) return svg;

    tokens.forEach(function(tag) {
        if (isSVGToken(tag)) {
            tag.attributes = tag.attributes.filter(hasNoWidthHeight);
        }
    });
    // Finally, assemble tokens
    svg = generate(tokens);

    return svg
}

function SVGInlineLoader (content) {
    this.cacheable && this.cacheable();
    this.value = content;
    return "module.exports = " + JSON.stringify(getExtractedSVG(content));
}

SVGInlineLoader.isSVGToken = isSVGToken;
SVGInlineLoader.hasNoWidthHeight = hasNoWidthHeight;
SVGInlineLoader.getExtractedSVG = getExtractedSVG ;

module.exports = SVGInlineLoader;
