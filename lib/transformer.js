var assign = require('object-assign');

var conditions = require('./conditions');
var defaultConfig = require('../config');

function removeSVGTagAttrs(tag) {
    if (conditions.isSVGToken(tag)) {
        tag.attributes = tag.attributes.filter(conditions.hasNoWidthHeight);
    }
    return tag;
}

function createRemoveTagAttrs(removingTagAttrs) {
    removingTagAttrs = removingTagAttrs || [];
    var hasNoAttributes = conditions.createHasNoAttributes(removingTagAttrs);
    return function removeTagAttrs(tag) {
        if (conditions.isStartTag(tag)) {
            tag.attributes = tag.attributes.filter(hasNoAttributes);
        }
        return tag;
    };
}

function isRemovingTag(removingTags, tag) {
    return removingTags.indexOf(tag.tagName) > -1;
}

// FIXME: Due to limtation of parser, we need to implement our
// very own little state machine to express tree structure

function createRemoveTags(removingTags) {
    removingTags = removingTags || [];
    var removingTag = null;

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

function getAttributeIndex (tag, attr) {
    if( tag.attributes !== undefined && tag.attributes.length > 0 ) {
        for(var i = 0; i < tag.attributes.length; i++) {
            if(tag.attributes[i][0] === attr) {
                return i;
            }
        }
    }
    return -1;
}

function createClassPrefix(classPrefix) {
    var re = /\.[\w\-]+/g;
    var inStyleTag = false;

    return function prefixClasses(tag) {
        if( inStyleTag ) {
            var string = tag.chars;
            // push matches to an array so we can operate in reverse
            var match;
            var matches = [];
            while(match = re.exec(string)) matches.push(match);
            // update the string in reverse so our matches indices don't get off
            for(var i = matches.length-1; i>=0; i--) {
                string = string.substring(0,matches[i].index+1) +
                    classPrefix +
                    string.substring(matches[i].index+1);
            }
            tag.chars = string;
            inStyleTag = false;
        }
        else if (conditions.isStyleToken(tag)) {
            inStyleTag = true;
        }
        else {
            var classIdx = getAttributeIndex(tag,'class');
            if(classIdx >= 0) {
                tag.attributes[classIdx][1] = classPrefix + tag.attributes[classIdx][1];
            }
        }
        return tag;
    };
}

function createIdPrefix(idPrefix) {
    var url_pattern = /^url\(#.+\)$/i;
    return function prefixIds(tag) {
        var idIdx = getAttributeIndex(tag, 'id');
        if (idIdx !== -1) {
            //  prefix id definitions
            tag.attributes[idIdx][1] = idPrefix + tag.attributes[idIdx][1];
        }

        if (tag.tagName == 'use') {
            // replace references via <use xlink:href='#foo'>
            var hrefIdx = getAttributeIndex(tag, 'xlink:href');
            if (hrefIdx !== -1) {
                tag.attributes[hrefIdx][1] = '#' + idPrefix + tag.attributes[hrefIdx][1].substring(1);

            }
        }
        if (tag.attributes && tag.attributes.length > 0) {
            // replace instances of url(#foo) in attributes
            tag.attributes.forEach(function (attr) {
                if (attr[1].match(url_pattern)) {
                    attr[1] = attr[1].replace(url_pattern, function (match) {
                        var id = match.substring(5, match.length -1);
                        return "url(#" + idPrefix + id + ")";
                    });
                }

            });
        }

        return tag;
    };
}

function runTransform(tokens, configOverride) {
    var transformations = [];
    var config = conditions.isFilledObject(configOverride) ? assign({}, defaultConfig, configOverride) : defaultConfig;

    if (config.classPrefix         !== false) transformations.push(createClassPrefix(config.classPrefix));
    if (config.idPrefix            !== false) transformations.push(createIdPrefix(config.idPrefix));
    if (config.removeSVGTagAttrs   === true)  transformations.push(removeSVGTagAttrs);
    if (config.removeTags          === true)  transformations.push(createRemoveTags(config.removingTags));
    if (config.removingTagAttrs.length  > 0)  transformations.push(createRemoveTagAttrs(config.removingTagAttrs));

    transformations.forEach(function (transformation) {
        tokens = tokens.map(transformation);
    });

    return tokens.filter(function (nonNull) { return nonNull; });
}

module.exports = {
    removeSVGTagAttrs: removeSVGTagAttrs,
    createRemoveTags: createRemoveTags,
    createClassPrefix: createClassPrefix,
    runTransform: runTransform
};
