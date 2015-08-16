var simpleHTMLTokenizer = require('simple-html-tokenizer');
var tokenize = simpleHTMLTokenizer.tokenize;
var generate = simpleHTMLTokenizer.generate;

function hasNoWidthHeight (attributeToken) {
    return attributeToken[0] !== 'width' && attributeToken[0] !== 'height';
}

function isSVGToken (tag) {
    return tag.type === 'StartTag' && tag.tagName === 'svg';
}

// TODO: find better parser/tokenizer
var regexSequences = [
    // Remove XML stuffs and comments
    [/<\?xml[\s\S]*?>/gi, ""],
    [/<!doctype[\s\S]*?>/gi, ""],
    [/<!--.*-->/gi, ""],

    // Non-displayed elements
    [/<title>.*<\/title>/gi, ""],
    [/<desc>.*<\/desc>/gi, ""],
    [/<defs>.*<\/defs>/gi, ""],

    // SVG XML -> HTML5
    [/\<([A-Za-z]+)([^\>]*)\/\>/g, "<$1$2></$1>"], // convert self-closing XML SVG nodes to explicitly closed HTML5 SVG nodes
    [/\s+/g, " "],                                 // replace whitespace sequences with a single space
    [/\> \</g, "><"],                              // remove whitespace between tags
];

function getExtractedSVG (svgStr) {
    // Clean-up XML crusts like comments and doctype, etc.
    var tokens;
    var cleanedUp = regexSequences.reduce(function (prev, regexSequence) {
        return ''.replace.apply(prev, regexSequence);
    }, svgStr).trim();

    // Tokenize and filter attributes using `simpleHTMLTokenizer.tokenize(source)`.
    try {
        tokens = tokenize(cleanedUp);
    } catch (e) {
        // If tokenization has failed, return earlier with cleaned-up string
        console.warn('svg-inline-loader: Tokenization has failed, please check SVG is correct.');
        return cleanedUp;
    }

    // If the token is <svg> start-tag, then remove width and height attributes.
    tokens.forEach(function(tag) {
        if (isSVGToken(tag)) {
            tag.attributes = tag.attributes.filter(hasNoWidthHeight);
        }
    });

    // Finally, assemble tokens
    return generate(tokens);
}

function SVGInlineLoader (content) {
    this.cacheable && this.cacheable();
    this.value = content;
    return "module.exports = " + JSON.stringify(getExtractedSVG(content));
}

SVGInlineLoader.isSVGToken = isSVGToken;
SVGInlineLoader.hasNoWidthHeight = hasNoWidthHeight;
SVGInlineLoader.getExtractedSVG = getExtractedSVG;
SVGInlineLoader.regexSequences = regexSequences;

module.exports = SVGInlineLoader;
