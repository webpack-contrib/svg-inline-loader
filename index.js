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

    // SVG XML -> HTML5
    [/\<([A-Za-z]+)([^\>]*)\/\>/g, "<$1$2></$1>"], // convert self-closing XML SVG nodes to explicitly closed HTML5 SVG nodes
    [/\s+/g, " "],                                 // replace whitespace sequences with a single space
    [/\> \</g, "><"],                              // remove whitespace between tags
];

var removingTags = [
    'title',
    'desc',
    'defs',
    'style'
];

function isRemovingTag (tag) {
    return removingTags.indexOf(tag.tagName) > -1;
}

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

    // FIXME: Due to limtation of parser, we need to implement our
    // very own little state machine to express tree structure
    var removingTag = null;
    // If the token is <svg> start-tag, then remove width and height attributes.
    return generate(tokens.map(function(tag) {
        if (removingTag == null) {
            // Reached start tag of a removing tag
            if (isRemovingTag(tag)) {
                removingTag = tag.tagName;
                tag = null;

            // Other stuffs that needs to be modified
            } else if (isSVGToken(tag)) {
                tag.attributes = tag.attributes.filter(hasNoWidthHeight);
            }
        } else {
            // Reached end tag of a removing tag
            if (tag.tagName === removingTag && tag.type === 'EndTag') {
                removingTag = null;
            }
            tag = null;
        }
        return tag;
    })
    .filter(function (nonNull) { return nonNull; }));
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
