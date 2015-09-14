function isSVGToken (tag) {
    return tag.type === 'StartTag' && tag.tagName === 'svg';
}

function isFilledObject (obj) {
    return obj != null &&
           typeof obj === 'object' &&
           Object.keys(obj).length !== 0;
}

function hasNoWidthHeight(attributeToken) {
    return attributeToken[0] !== 'width' && attributeToken[0] !== 'height';
}

module.exports = {
    isSVGToken: isSVGToken,
    isFilledObject: isFilledObject,
    hasNoWidthHeight: hasNoWidthHeight
};
