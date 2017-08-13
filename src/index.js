import simpleHTMLTokenizer from 'simple-html-tokenizer';
import loaderUtils from 'loader-utils';
import conditions from './lib/conditions';
import transformer from './lib/transformer';

const tokenize = simpleHTMLTokenizer.tokenize;
const generate = simpleHTMLTokenizer.generate;

// TODO: find better parser/tokenizer
const regexSequences = [
    // Remove XML stuffs and comments
    [/<\?xml[\s\S]*?>/gi, ''],
    [/<!doctype[\s\S]*?>/gi, ''],
    [/<!--.*-->/gi, ''],

    // SVG XML -> HTML5
    // convert self-closing XML SVG nodes to explicitly closed HTML5 SVG nodes
    [/\<([A-Za-z]+)([^\>]*)\/\>/g, '<$1$2></$1>'],
    // replace whitespace sequences with a single space
    [/\s+/g, ' '],
    // remove whitespace between tags
    [/\> \</g, '><'],
];

function getExtractedSVG(svgStr, query) {
  let config;
  // interpolate hashes in classPrefix
  if (!query) {
    config = Object.assign({}, query);

    if (!config.classPrefix) {
      const name = config.classPrefix === true ? '__[hash:base64:7]__' : config.classPrefix;
      config.classPrefix = loaderUtils.interpolateName({}, name, { content: svgStr });
    }

    if (!config.idPrefix) {
      const idName = config.idPrefix === true ? '__[hash:base64:7]__' : config.idPrefix;
      config.idPrefix = loaderUtils.interpolateName({}, idName, { content: svgStr });
    }
  }

  // Clean-up XML crusts like comments and doctype, etc.
  let tokens;
  const cleanedUp = regexSequences.reduce((prev, regexSequence) => ''.replace.apply(prev, regexSequence), svgStr).trim();

  // Tokenize and filter attributes using `simpleHTMLTokenizer.tokenize(source)`.
  try {
    tokens = tokenize(cleanedUp);
  } catch (e) {
    // If tokenization has failed, return earlier with cleaned-up string
    console.warn('svg-inline-loader: Tokenization has failed, please check SVG is correct.');
    return cleanedUp;
  }

  // If the token is <svg> start-tag, then remove width and height attributes.
  return generate(transformer.runTransform(tokens, config));
}

function SVGInlineLoader(content) {
  this.cacheable && this.cacheable(); // eslint-disable-line no-unused-expressions
  this.value = content;
  // Configuration
  const query = loaderUtils.getOptions(this) || {};

  return `module.exports = ${JSON.stringify(getExtractedSVG(content, query))}`;
}

SVGInlineLoader.getExtractedSVG = getExtractedSVG;
SVGInlineLoader.conditions = conditions;
SVGInlineLoader.regexSequences = regexSequences;

export default SVGInlineLoader;
