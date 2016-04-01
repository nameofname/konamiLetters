(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.konamiLetters = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// Key array defaults to the konami code :
var defaultSeries = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
// An array of the keys pressed (to listen for the konami code):
var keysPressed = [];
var currIndex = 0;

var keyTracker = function keyTracker(keyArray, callback) {
    document.onkeydown = function (e) {
        var key = e.which;
        keyArray = keyArray || defaultSeries;

        if (keyArray[currIndex] === key) {
            // If the key pressed was the next in the series, push it to the array of pressed letters :
            keysPressed.push(key);
            currIndex += 1;} else 

        {
            // if the key pressed does not match the current, then start over :
            keysPressed = [];
            currIndex = 0;
            if (keyArray[0] === key) {
                keysPressed.push(key);
                currIndex += 1;}}



        // Now test for a complete match:
        if (keysPressed.length === keyArray.length) {callback();}};};



module.exports = keyTracker;
},{}],2:[function(require,module,exports){
"use strict";


var letterArranger = require('./letterArranger');
var keyTracker = require('./keyTracker');
var happy_face = require('./patterns/happy_face');


/**
 * a function that calls the letter arranger, defaults to the konami code as the key array and the happy face as the
 * pattern.
 * @param keyArr <array> an array of key character codes
 * @param pattern <array> an object describing the pattern to draw
 * @param callback <function> executes on completion synchronously
 */
module.exports = function (keyArr, pattern, callback) {
    pattern = pattern || happy_face;
    keyTracker(keyArr, function () {
        letterArranger(pattern);
        if (callback instanceof Function) {
            callback();}});};
},{"./keyTracker":1,"./letterArranger":3,"./patterns/happy_face":4}],3:[function(require,module,exports){
"use strict";

/**
 * Takes an array of line objects. Each line must have an upper and lower bound (for x OR y) and a function that
 * describes the relationship between x and y.
 *
 * Here are some examples of line configurations:
 *      [{
 *          xLower : -10,
 *          xUpper : 10,
 *          equation : function (x) { return x + 1}
 *      }, {
 *          yLower : -20,
 *          yUpper : 20,
 *          equation : function (x) { return x + 1}
 *      }];
 *
 * Note* A line configuration cannot have both x and y boundaries (ie. xLower and xUpper, or yLower and yUpper)
 *
 * Using the public methods of the letter arranger, you will be able to re-arrange all the letters on the page to match
 * the lines you describe.
 *
 * @param pattern <array>
 */


var lines = void 0; // a reference to the pattern passed to the entry function.
var letters = []; // References to all of the wrapped letters on the page, and all the text nodes on the page:
var textNodes = [];
var letterNum = null; // The number of letters on the page:
var interval = null; // an interval for updating the color which can be stopped.
var bodyHeight = null; // The width and height of the body document that you are dealing with.
var bodyWidth = null;
var totalLettersUsed = 0; // The total letters assigned to a line:
var assignmentOffset = 0; // Place holder used to iterate over all the letters on the page.

// Generate a new random RGB color.
var newNum = function newNum() {
    return Math.floor(Math.random() * 256);};

var _newColor = function _newColor() {
    var color = 'rgb(' + newNum() + ',' + newNum() + ',' + newNum() + ')';
    return color;};



/**
 * Evaluate each of the passed in line descriptions, and prepare the document to be ... played with.
 * @private
 */
var _init = function _init() {
    var totalRange = 0;

    for (var n = 0; n < lines.length; n++) {
        var line = lines[n];

        // First get the range of the line based on either the x or y boundaries:
        if (line.hasOwnProperty('xLower') && line.hasOwnProperty('xUpper')) {
            line.range = line.xUpper - line.xLower;} else 
        if (line.hasOwnProperty('yLower') && line.hasOwnProperty('yUpper')) {
            line.range = line.yUpper - line.yLower;

            // If the line has no bounds, then throw an error.
        } else {
                throw new Error('You must include either x or y boundaries for each line configuration passed');}


        // Add a plot attribute to each line:
        lines[n].plot = [];

        // Add up the total range of all of the lines
        // used later on to figure out how many letters assigned to each line.
        // It's a crude solution that doesn't account for curvature in the lines, but the length or width of each
        // line is taken into account along the x or y access. This means lines straight up or across will have
        // proportionally more letters assigned to them.
        totalRange += lines[n].range;}


    // Wrap all the letters in a span tag and get the returned list.
    letters = _wrapLetters();

    // Set the x y default position of each of the letters.
    // Remove stylesheets and Add base styling to make this all possible:
    _prepDocument();

    letterNum = letters.length;

    // For each line, figure out how many letters should be assigned to that line:
    for (var i = 0; i < lines.length; i++) {
        var linea = lines[i];

        // The lines number of letters is the ratio of the lines range by the total range of all lines passed,
        // multiplied by the total number of letters in the document.
        linea.numLetters = Math.floor(letterNum * (linea.range / totalRange));
        totalLettersUsed += linea.numLetters;}


    // Note * Since we are using Math.floor to calculate the numLetters - sometimes there will be a small remainder.
    // Check for this case and adjust:
    if (letterNum !== totalLettersUsed) {

        // Add the remainder letters to the last line:
        lines[lines.length - 1].numLetters += letterNum - totalLettersUsed;
        totalLettersUsed += letterNum - totalLettersUsed;}


    // Now that we have assigned all the letters to one line or another, figure out the interval for each line,
    // and create a plot for each line.
    for (var j = 0; j < lines.length; j++) {
        var lineb = lines[j];

        // Find the interval of each line based on the number of letters divided by the range:
        lineb.interval = lineb.range / lineb.numLetters;

        // For each function, invoke it for it's specified range along the specified interval:
        _createPlot(lineb);}


    return this;};


var _setStyleString = function _setStyleString(str) {
    var style = $('<style type="text/css">' + str + '</style>');
    $('html > head').append(style);};


/**
 * Preps the document to be manipulated. Removes all stylesheets and adds some base styling:
 * @private
 */
var _prepDocument = function _prepDocument() {
    var visibilityStyle = 'div { transition: visibility: 5s;}';
    var motionStyle = '.nerp {' + 
    'position: absolute;' + 
    'transition: top 20s, left 20s, font-size 20s;' + 
    'transform: translate3d(0,0,0); }';

    $('.nerp').each(function () {
        var position = $(this).offset();
        $(this).css({ left: position.left + 'px', top: position.top + 'px' });});


    _setStyleString(motionStyle);

    // Now select all of the .nerp elements on the page, and remove them temporarily:
    var $nerps = $('.nerp').detach();

    $('body').empty();
    $('body').append($nerps);

    $('link').remove();
    _setStyleString(visibilityStyle);
    bodyWidth = document.getElementsByTagName('body')[0].offsetWidth;
    bodyHeight = document.getElementsByTagName('body')[0].offsetHeight;};




/**
 * Wrap each of the letters on the page in a span tag, and return a DOM reference to the letters on the page.
 * @private
 */
var _wrapLetters = function _wrapLetters() {
    _getTextNodes(document.getElementsByTagName('body')[0]);

    for (var i = 0; i < textNodes.length; i++) {
        var textArr = textNodes[i].nodeValue.split('');
        var parentElement = textNodes[i].parentElement;

        parentElement.removeChild(textNodes[i]);
        for (var x = 0; x < textArr.length; x++) {

            // Do a double check here for empty string text nodes (do not use the empty strings in between
            // other full strings):
            if (textArr[x] !== ' ') {
                var newSpan = document.createElement('span');

                newSpan.setAttribute('class', 'nerp');

                newSpan.appendChild(document.createTextNode(textArr[x]));
                parentElement.appendChild(newSpan, textArr[x]);}}}




    return document.getElementsByClassName('nerp');};



/**
 * Via StackOverflow.
 * User:
 * http://stackoverflow.com/users/515502/rahat-ahmed
 */
var _getTextNodes = function _getTextNodes(element) {

    // Don't recurse into scripts, kill 'em.
    if (element.tagName === 'SCRIPT') {
        element.remove();} else 
    {
        if (element.childNodes.length > 0) {
            for (var i = 0; i < element.childNodes.length; i++) {
                _getTextNodes(element.childNodes[i]);}}



        if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim() != '') {
            textNodes.push(element);}}};




/**
 * Creates the (x,y) coordinates for each of the letters in a given line based on the passed line configurations,
 * and the leg work done above.
 * Assigns the (x,y) coordinates to the letters allotted to the given line.
 * @param line
 * @private
 */
var _createPlot = function _createPlot(line) {
    var numLetters = line.numLetters;
    var interval = line.interval;
    var lower = line.hasOwnProperty('xLower') ? line.xLower : line.yLower;
    var equation = line.equation;

    // Now plot the points on the line based on the lower bound and the interval:
    for (var x = 0; x < numLetters; x++) {

        var x1 = lower + x * interval;
        var y = equation(x1);
        // now find the coordinates relative to the width of the document, expecting that 0 is the midline of the
        // document on both the x and y axis
        var relativeX = x1 + bodyWidth / 2;
        var relativeY = y + bodyHeight / 2;

        var coordinates = [relativeX, relativeY];
        line.plot.push(coordinates);

        // use assignmentOffset so your place is held as _createPlot gets called on subsequent lines
        letters[assignmentOffset].plotPoint = coordinates;
        assignmentOffset++;}};




/**
 * Stop the dance.
 */
var stop = function stop() {
    clearInterval(interval);};


/**
 * Start moving the letters on the page according to CSS transitions, then according to an interval which will
 * flash all the letters different colors.
 */
var startMoving = function startMoving() {

    for (var i = 0; i < letters.length; i++) {
        var letter = letters[i];
        letter.style.left = letter.plotPoint[0] + 'px';
        letter.style.top = letter.plotPoint[1] + 'px';
        letter.style.fontSize = '20px';}


    // Increase the font size (this is a transition as stated above which is why it's done in a subsequent loop)
    for (var j = 0; j < letters.length; j++) {
        letters[j].style.fontSize = '100px';}


    // Set an interval to flash a different color every half second.
    interval = setInterval(function () {

        for (var k = 0; k < letters.length; k++) {
            letters[k].style.color = _newColor();}}, 


    5000); // TODO !!! determine whether 5 seconds is the proper timeout.
};




module.exports = function (pattern) {
    if (!pattern) {
        throw new Error('You cannot use the LetterArranger without an an array of objects describing the pattern.');}

    lines = pattern;
    _init();
    startMoving();};
},{}],4:[function(require,module,exports){
"use strict";

var happy_face = [
// this one is the smile
{ 
    xLower: -250, 
    xUpper: 250, 
    equation: function equation(x) {
        x = parseInt(x);
        var y = Math.sqrt(62500 - x * x);
        return y;}


    // The top and bottom of the left eye
}, { 
    xLower: -215, 
    xUpper: -185, 
    equation: function equation(x) {
        x = parseInt(x);
        var y = Math.sqrt(225 - Math.pow(x + 200, 2)) - 200;
        return y;} }, 

{ 
    xLower: -215, 
    xUpper: -185, 
    equation: function equation(x) {
        x = parseInt(x);
        var y = -1 * Math.sqrt(225 - Math.pow(x + 200, 2)) - 200;
        return y;}


    // The top and bottom of the RIGHT eye
}, { 
    xLower: 185, 
    xUpper: 215, 
    equation: function equation(x) {
        x = parseInt(x);
        var y = Math.sqrt(225 - Math.pow(x - 200, 2)) - 200;
        return y;} }, 

{ 
    xLower: 185, 
    xUpper: 215, 
    equation: function equation(x) {
        x = parseInt(x);
        var y = -1 * Math.sqrt(225 - Math.pow(x - 200, 2)) - 200;
        return y;} }];




module.exports = happy_face;
},{}]},{},[2])(2)
});