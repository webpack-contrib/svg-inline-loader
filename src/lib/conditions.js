function isStartTag(tag) {
  return tag !== undefined && tag.type === 'StartTag';
}

function isSVGToken(tag) {
  return isStartTag(tag) && tag.tagName === 'svg';
}

function isStyleToken(tag) {
  return isStartTag(tag) && tag.tagName === 'style';
}

function isFilledObject(obj) {
  return (
    obj != null && typeof obj === 'object' && Object.keys(obj).length !== 0
  );
}

function hasNoWidthHeight(attributeToken) {
  return attributeToken[0] !== 'width' && attributeToken[0] !== 'height';
}

function createHasNoAttributes(attributes) {
  return function hasNoAttributes(attributeToken) {
    return !attributes.includes(attributeToken[0]);
  };
}

function createHasAttributes(attributes) {
  return function hasAttributes(attributeToken) {
    return attributes.includes(attributeToken[0]);
  };
}

export default {
  isSVGToken,
  isStyleToken,
  isFilledObject,
  hasNoWidthHeight,
  createHasNoAttributes,
  createHasAttributes,
  isStartTag,
};
