/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!***********************************!*\
  !*** ./src/konamiLettersEntry.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	
	var letterArranger = __webpack_require__(/*! ./letterArranger */ 1);
	var keyTracker = __webpack_require__(/*! ./keyTracker */ 2);
	var happy_face = __webpack_require__(/*! ./patterns/happy_face */ 3);
	
	
	
	
	
	
	
	
	
	module.exports = function (keyArr, pattern, callback) {
	    pattern = pattern || happy_face;
	    keyTracker(keyArr, function () {
	        letterArranger(pattern);
	        if (callback instanceof Function) {
	            callback();}});};

/***/ },
/* 1 */
/*!*******************************!*\
  !*** ./src/letterArranger.js ***!
  \*******************************/
/***/ function(module, exports) {

	"use strict";
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var lines = void 0;
	var letters = [];
	var textNodes = [];
	var letterNum = null;
	var interval = null;
	var bodyHeight = null;
	var bodyWidth = null;
	var totalLettersUsed = 0;
	var assignmentOffset = 0;
	var nodeClass = 'nerp';
	var nodeClassName = '.' + nodeClass;
	
	
	var newNum = function newNum() {
	    return Math.floor(Math.random() * 256);};
	
	var _newColor = function _newColor() {
	    var color = 'rgb(' + newNum() + ',' + newNum() + ',' + newNum() + ')';
	    return color;};
	
	
	
	
	
	
	
	var _init = function _init() {
	    var totalRange = 0;
	
	    for (var n = 0; n < lines.length; n++) {
	        var line = lines[n];
	
	
	        if (line.hasOwnProperty('xLower') && line.hasOwnProperty('xUpper')) {
	            line.range = line.xUpper - line.xLower;} else 
	        if (line.hasOwnProperty('yLower') && line.hasOwnProperty('yUpper')) {
	            line.range = line.yUpper - line.yLower;} else 
	
	
	            {
	                throw new Error('You must include either x or y boundaries for each line configuration passed');}
	
	
	
	        lines[n].plot = [];
	
	
	
	
	
	
	        totalRange += lines[n].range;}
	
	
	
	    letters = _cloneLetters();
	    return;
	
	
	
	    _prepDocument();
	
	    letterNum = letters.length;
	
	
	    for (var i = 0; i < lines.length; i++) {
	        var linea = lines[i];
	
	
	
	        linea.numLetters = Math.floor(letterNum * (linea.range / totalRange));
	        totalLettersUsed += linea.numLetters;}
	
	
	
	
	    if (letterNum !== totalLettersUsed) {
	
	
	        lines[lines.length - 1].numLetters += letterNum - totalLettersUsed;
	        totalLettersUsed += letterNum - totalLettersUsed;}
	
	
	
	
	    for (var j = 0; j < lines.length; j++) {
	        var lineb = lines[j];
	
	
	        lineb.interval = lineb.range / lineb.numLetters;
	
	
	        _createPlot(lineb);}
	
	
	    return this;};
	
	
	var _setStyleString = function _setStyleString(str) {
	    var style = $('<style type="text/css">' + str + '</style>');
	    $('html > head').append(style);};
	
	
	
	
	
	
	
	
	var _prepDocument = function _prepDocument() {
	    var motionStyle = nodeClassName + '{' + 
	    'position: absolute;' + 
	    'transition: top 20s, left 20s, font-size 20s;' + 
	    'transform: translate3d(0,0,0); }';
	
	
	    $(nodeClassName).each(function () {
	        var position = $(this).offset();
	        $(this).css({ left: position.left + 'px', top: position.top + 'px' });});
	
	
	
	    _setStyleString(motionStyle);
	
	
	    var $clonedLetters = $(nodeClassName).detach();
	
	
	    $('body').empty();
	    $('body').append($clonedLetters);
	    $('link').remove();
	
	
	
	    bodyWidth = document.getElementsByTagName('body')[0].offsetWidth;
	    bodyHeight = document.getElementsByTagName('body')[0].offsetHeight;};
	
	
	
	
	
	
	
	var _cloneLetters = function _cloneLetters() {
	    var body = document.getElementsByTagName('body')[0];
	
	
	    _getTextNodes(body);
	
	
	
	    for (var i = 0; i < textNodes.length; i++) {
	
	        var textArr = textNodes[i].nodeValue.split('');
	        var parentElement = textNodes[i].parentElement;
	        var removedNode = parentElement.removeChild(textNodes[i]);
	        var previousInsertedEl = parentElement.firstChild;
	
	        for (var x = 0; x < textArr.length; x++) {
	
	            var newSpan = document.createElement('span');
	            newSpan.setAttribute('class', nodeClass);
	            newSpan.appendChild(document.createTextNode(textArr[x]));
	            parentElement.appendChild(newSpan);
	
	
	
	            newSpan.id = 'nerp-' + x;
	            previousInsertedEl = newSpan;}
	
	
	
	
	
	
	
	
	        var newLetters = document.querySelectorAll('.' + nodeClass);
	        for (var j = 0; j < newLetters.length; j++) {
	            var letter = newLetters[j];
	            var position = letter.getBoundingClientRect();
	
	            letter.style.top = position.top + 'px';
	            letter.style.left = position.left + 'px';}
	
	
	        var docFrag = document.createDocumentFragment();
	        for (var k = 0; k < newLetters.length; k++) {
	            var _letter = newLetters[k].parentElement.removeChild(newLetters[k]);
	            _letter.style.position = 'absolute';
	            docFrag.appendChild(_letter);}
	
	
	        body.appendChild(docFrag);
	
	        parentElement.appendChild(removedNode);}
	
	
	
	    for (var _i = 0; _i < textNodes.length; _i++) {
	        textNodes[_i].parentElement.removeChild(textNodes[_i]);}
	
	
	    return document.getElementsByClassName(nodeClass);};
	
	
	
	
	
	
	
	
	var _getTextNodes = function _getTextNodes(element) {
	
	
	    if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim() != '') {
	        textNodes.push(element);} else 
	
	    if (element.childNodes.length > 0) {
	        for (var i = 0; i < element.childNodes.length; i++) {
	            _getTextNodes(element.childNodes[i]);}}};
	
	
	
	
	
	
	
	
	
	
	
	var _createPlot = function _createPlot(line) {
	    var numLetters = line.numLetters;
	    var interval = line.interval;
	    var lower = line.hasOwnProperty('xLower') ? line.xLower : line.yLower;
	    var equation = line.equation;
	
	
	    for (var x = 0; x < numLetters; x++) {
	
	        var x1 = lower + x * interval;
	        var y = equation(x1);
	
	
	        var relativeX = x1 + bodyWidth / 2;
	        var relativeY = y + bodyHeight / 2;
	
	        var coordinates = [relativeX, relativeY];
	        line.plot.push(coordinates);
	
	
	        letters[assignmentOffset].plotPoint = coordinates;
	        assignmentOffset++;}};
	
	
	
	
	
	
	
	var stop = function stop() {
	    clearInterval(interval);};
	
	
	
	
	
	
	var startMoving = function startMoving() {
	
	    for (var i = 0; i < letters.length; i++) {
	        var letter = letters[i];
	        letter.style.left = letter.plotPoint[0] + 'px';
	        letter.style.top = letter.plotPoint[1] + 'px';
	        letter.style.fontSize = '20px';}
	
	
	
	    for (var j = 0; j < letters.length; j++) {
	        letters[j].style.fontSize = '100px';}
	
	
	
	    interval = setInterval(function () {
	
	        for (var k = 0; k < letters.length; k++) {
	            letters[k].style.color = _newColor();}}, 
	
	
	    5000);};
	
	
	
	
	module.exports = function (pattern) {
	    if (!pattern) {
	        throw new Error('You cannot use the LetterArranger without an an array of objects describing the pattern.');}
	
	    lines = pattern;
	    _init();};

/***/ },
/* 2 */
/*!***************************!*\
  !*** ./src/keyTracker.js ***!
  \***************************/
/***/ function(module, exports) {

	"use strict";
	
	
	var defaultSeries = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
	
	var keysPressed = [];
	var currIndex = 0;
	
	var keyTracker = function keyTracker(keyArray, callback) {
	    document.onkeydown = function (e) {
	        var key = e.which;
	        keyArray = keyArray || defaultSeries;
	
	        if (keyArray[currIndex] === key) {
	
	            keysPressed.push(key);
	            currIndex += 1;} else 
	
	        {
	
	            keysPressed = [];
	            currIndex = 0;
	            if (keyArray[0] === key) {
	                keysPressed.push(key);
	                currIndex += 1;}}
	
	
	
	
	        if (keysPressed.length === keyArray.length) {callback();}};};
	
	
	
	module.exports = keyTracker;

/***/ },
/* 3 */
/*!************************************!*\
  !*** ./src/patterns/happy_face.js ***!
  \************************************/
/***/ function(module, exports) {

	"use strict";
	
	var happy_face = [
	
	{ 
	    xLower: -250, 
	    xUpper: 250, 
	    equation: function equation(x) {
	        x = parseInt(x);
	        var y = Math.sqrt(62500 - x * x);
	        return y;} }, 
	
	
	
	{ 
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
	        return y;} }, 
	
	
	
	{ 
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

/***/ }
/******/ ]);
//# sourceMappingURL=konamiLetters.js.map