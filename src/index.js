import { tokenize, generate } from 'simple-html-tokenizer';
import { getOptions, interpolateName } from 'loader-utils';
import validateOptions from 'schema-utils';
import schema from './options.json';
import conditions from './lib/conditions';
import transformer from './lib/transformer';

export const raw = true;

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

function getExtractedSVG(svgStr, options) {
  let config;
  // interpolate hashes in classPrefix
  if (!options) {
    config = Object.assign({}, options);

    if (!config.classPrefix) {
      const name =
        config.classPrefix === true
          ? '__[hash:base64:7]__'
          : config.classPrefix;
      config.classPrefix = interpolateName({}, name, {
        content: svgStr,
      });
    }

    if (!config.idPrefix) {
      const idName =
        config.idPrefix === true ? '__[hash:base64:7]__' : config.idPrefix;
      config.idPrefix = interpolateName({}, idName, {
        content: svgStr,
      });
    }
  }

  // Clean-up XML crusts like comments and doctype, etc.
  let tokens;
  const cleanedUp = regexSequences
    .reduce(
      (prev, regexSequence) => ''.replace.apply(prev, regexSequence),
      svgStr
    )
    .trim();

  // Tokenize and filter attributes using `simpleHTMLTokenizer.tokenize(source)`.
  try {
    tokens = tokenize(cleanedUp);
  } catch (e) {
    // If tokenization has failed, return earlier with cleaned-up string
    console.warn(
      'svg-inline-loader: Tokenization has failed, please check SVG is correct.'
    );
    return cleanedUp;
  }

  // If the token is <svg> start-tag, then remove width and height attributes.
  return generate(transformer.runTransform(tokens, config));
}

function SVGInlineLoader(content) {
  const options = getOptions(this) || {};

  validateOptions(schema, options, 'SVGInlineLoader');

  return `module.exports = ${JSON.stringify(
    getExtractedSVG(content, options)
  )}`;
}

SVGInlineLoader.getExtractedSVG = getExtractedSVG;
SVGInlineLoader.conditions = conditions;
SVGInlineLoader.regexSequences = regexSequences;

export default SVGInlineLoader;
