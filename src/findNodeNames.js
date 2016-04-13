"use strict";

/**
 * Recurses over all of the nodes in the HTML <body> and finds all of the tag names
 * @returns {Array}
 */
var findNodeNames = function () {
    var recurse = function (currElement, obj, arr) {
        if (!obj[currElement.tagName]) {
            arr.push(currElement.tagName);
        }
        obj[currElement.tagName] = true;

        if (currElement.childNodes.length > 0) {
            for (var i = 0; i < currElement.childNodes.length; i++) {
                recurse(currElement.childNodes[i], obj, arr);
            }
        }
    };
    var obj = {};
    var arr = [];
    var el = document.getElementsByTagName('body')[0];
    recurse(el, obj, arr);
    return arr;
};

module.exports = findNodeNames;