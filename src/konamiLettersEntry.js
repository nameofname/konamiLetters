"use strict";


var LetterArranger = require('./letterArranger');
var keyTracker = require('./keyTracker');
var happy_face = require('../patterns/happy_face');


/**
 * a function that calls the letter arranger, defaults to the konami code as the key array and the happy face as the
 * pattern.
 * @param keyArr <array> an array of key character codes
 * @param pattern <array> an object describing the pattern to draw
 * @param callback <function> executes on completion synchronously
 */
module.exports = function (keyArr, pattern, callback) {
    pattern = pattern || happy_face;
    var arranger = new LetterArranger(pattern);
    keyTracker(keyArr, function () {
        arranger
            .init()
            .startMoving();

        if (callback instanceof Function) {
            callback();
        }
    });
};
