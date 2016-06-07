function isStartTag (tag) {
    return tag !== undefined && tag.type === 'StartTag';
}

function isSVGToken (tag) {
    return isStartTag(tag) && tag.tagName === 'svg';
}

function isFilledObject (obj) {
    return obj != null &&
           typeof obj === 'object' &&
           Object.keys(obj).length !== 0;
}

function hasNoWidthHeight(attributeToken) {
    return attributeToken[0] !== 'width' && attributeToken[0] !== 'height';
}

function createHasNoAttributes(attributes) {
    return function hasNoAttributes(attributeToken) {
      return attributes.indexOf(attributeToken[0]) === -1;
    }
}

module.exports = {
    isSVGToken: isSVGToken,
    isFilledObject: isFilledObject,
    hasNoWidthHeight: hasNoWidthHeight,
    createHasNoAttributes: createHasNoAttributes,
    isStartTag: isStartTag
};
