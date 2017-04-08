import defaultConfig from '../config';
import conditions from './conditions';

function removeSVGTagAttrs(tag) {
  if (conditions.isSVGToken(tag)) {
    tag.attributes = tag.attributes.filter(conditions.hasNoWidthHeight);
  }
  return tag;
}

function createRemoveTagAttrs(removingTagAttrs = []) {
  const hasNoAttributes = conditions.createHasNoAttributes(removingTagAttrs);
  return function removeTagAttrs(tag) {
    if (conditions.isStartTag(tag)) {
      tag.attributes = tag.attributes.filter(hasNoAttributes);
    }
    return tag;
  };
}
function createWarnTagAttrs(warnTagAttrs = []) {
  const hasNoAttributes = conditions.createHasAttributes(warnTagAttrs);
  return function warnTagAttrs(tag) {
    if (conditions.isStartTag(tag)) {
      const attrs = tag.attributes.filter(hasNoAttributes);
      if (attrs.length > 0) {
        const attrList = [];

        for (const attr of attrs) {
          attrList.push(attr[0]);
        }

        console.warn(`svg-inline-loader: tag ${tag.tagName} has forbidden attrs: ${attrList.join(', ')}`);
      }
    }
    return tag;
  };
}
function isRemovingTag(removingTags, tag) {
  return removingTags.includes(tag.tagName);
}
function isWarningTag(warningTags, tag) {
  return warningTags.includes(tag.tagName);
}
// FIXME: Due to limtation of parser, we need to implement our
// very own little state machine to express tree structure

function createRemoveTags(removingTags = []) {
  let removingTag = null;

  return function removeTags(tag) {
    if (removingTag == null) {
      if (isRemovingTag(removingTags, tag)) {
        removingTag = tag.tagName;
      } else {
        return tag;
      }
    } else if (tag.tagName === removingTag && tag.type === 'EndTag') {
      // Reached the end tag of a removingTag
      removingTag = null;
    }
  };
}

function createWarnTags(warningTags = []) {
  return function warnTags(tag) {
    if (conditions.isStartTag(tag) && isWarningTag(warningTags, tag)) {
      console.warn(`svg-inline-loader: forbidden tag ${tag.tagName}`);
    }
    return tag;
  };
}
function getAttributeIndex(tag, attr) {
  if (tag.attributes !== undefined && tag.attributes.length > 0) {
    for (let i = 0; i < tag.attributes.length; i++) {
      if (tag.attributes[i][0] === attr) {
        return i;
      }
    }
  }
  return -1;
}

function createClassPrefix(classPrefix) {
  // http://stackoverflow.com/questions/12391760/regex-match-css-class-name-from-single-string-containing-multiple-classes
  const re = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/g;
  let inStyleTag = false;

  return function prefixClasses(tag) {
    if (inStyleTag) {
      let string = tag.chars;
      // push matches to an array so we can operate in reverse
      let match;
      const matches = [];
      while (match = re.exec(string)) matches.push(match);
      // update the string in reverse so our matches indices don't get off
      for (let i = matches.length - 1; i >= 0; i--) {
        string = string.substring(0, matches[i].index + 1) +
          classPrefix +
          string.substring(matches[i].index + 1);
      }
      tag.chars = string;
      inStyleTag = false;
    } else if (conditions.isStyleToken(tag)) {
      inStyleTag = true;
    } else {
      const classIdx = getAttributeIndex(tag, 'class');
      if (classIdx >= 0) {
        // Prefix classes when multiple classes are present
        let classes = tag.attributes[classIdx][1];
        let prefixedClassString = '';

        classes = classes.replace(/[ ]+/, ' ');
        classes = classes.split(' ');
        classes.forEach((classI) => {
          prefixedClassString += `${classPrefix + classI} `;
        });

        tag.attributes[classIdx][1] = prefixedClassString;
      }
    }
    return tag;
  };
}

function createIdPrefix(idPrefix) {
  const urlPattern = /^url\(#.+\)$/i;
  return function prefixIds(tag) {
    const idIdx = getAttributeIndex(tag, 'id');
    if (idIdx !== -1) {
      //  prefix id definitions
      tag.attributes[idIdx][1] = idPrefix + tag.attributes[idIdx][1];
    }

    if (tag.tagName === 'use') {
      // replace references via <use xlink:href='#foo'>
      const hrefIdx = getAttributeIndex(tag, 'xlink:href');
      if (hrefIdx !== -1) {
        tag.attributes[hrefIdx][1] = `#${idPrefix}${tag.attributes[hrefIdx][1].substring(1)}`;
      }
    }
    if (tag.attributes && tag.attributes.length > 0) {
      // replace instances of url(#foo) in attributes
      tag.attributes.forEach((attr) => {
        if (attr[1].match(urlPattern)) {
          attr[1] = attr[1].replace(urlPattern, (match) => {
            const id = match.substring(5, match.length - 1);
            return `url(#${idPrefix}${id})`;
          });
        }
      });
    }

    return tag;
  };
}

function runTransform(tokens, configOverride) {
  const transformations = [];
  const config = conditions.isFilledObject(configOverride) ? Object.assign({}, defaultConfig, configOverride) : defaultConfig;

  if (config.classPrefix !== false) transformations.push(createClassPrefix(config.classPrefix));
  if (config.idPrefix !== false) transformations.push(createIdPrefix(config.idPrefix));
  if (config.removeSVGTagAttrs === true) transformations.push(removeSVGTagAttrs);
  if (config.warnTags.length > 0) transformations.push(createWarnTags(config.warnTags));
  if (config.removeTags === true) transformations.push(createRemoveTags(config.removingTags));
  if (config.warnTagAttrs.length > 0) transformations.push(createWarnTagAttrs(config.warnTagAttrs));
  if (config.removingTagAttrs.length > 0) transformations.push(createRemoveTagAttrs(config.removingTagAttrs));

  transformations.forEach((transformation) => {
    tokens = tokens.map(transformation);
  });

  return tokens.filter(nonNull => nonNull);
}

export default {
  removeSVGTagAttrs,
  createRemoveTags,
  createClassPrefix,
  runTransform,
};
