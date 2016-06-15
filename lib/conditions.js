function isSVGToken (tag) {
    return tag.type === 'StartTag' && tag.tagName === 'svg';
}

function isStyleToken (tag) {
    return tag.type === 'StartTag' && tag.tagName === 'style';
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
    isStyleToken: isStyleToken,
    isFilledObject: isFilledObject,
    hasNoWidthHeight: hasNoWidthHeight
};
