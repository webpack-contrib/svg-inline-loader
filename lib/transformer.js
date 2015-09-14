var assign = require('object-assign');

var conditions = require('./conditions');
var defaultConfig = require('../config');


function removeSVGTagAttrs(tag) {
    if (conditions.isSVGToken(tag)) {
        tag.attributes = tag.attributes.filter(conditions.hasNoWidthHeight);
    }
    return tag;
}

function isRemovingTag(tag) {
    return defaultConfig.removingTags.indexOf(tag.tagName) > -1;
}

// FIXME: Due to limtation of parser, we need to implement our
// very own little state machine to express tree structure

function createRemoveTags() {
    var removingTag = null;

    return function removeTags(tag) {
        if (removingTag == null) {
            if (isRemovingTag(tag)) {
                removingTag = tag.tagName;
            } else {
                return tag;
            }
        } else if (tag.tagName === removingTag && tag.type === 'EndTag') {
            // Reached the end tag of a removingTag
            removingTag = null;
        }
    }
}

function runTransform(tokens, configOverride) {
    var transformations = [];
    var config = conditions.isFilledObject(configOverride) ? assign({}, defaultConfig, configOverride) :
                                                             defaultConfig;

    if (config.removeSVGTagAttrs === true) transformations.push(removeSVGTagAttrs);
    if (config.removeTags        === true) transformations.push(createRemoveTags());

    transformations.forEach(function (transformation) {
        tokens = tokens.map(transformation);
    });

    return tokens.filter(function (nonNull) { return nonNull; });
}

module.exports = {
    removeSVGTagAttrs: removeSVGTagAttrs,
    createRemoveTags: createRemoveTags,
    runTransform: runTransform
};
