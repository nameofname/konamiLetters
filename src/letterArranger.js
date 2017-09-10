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


const textNodes = [];
const nodeClass = 'nerp';
const nodeClassName = '.' + nodeClass;
let lines; // a reference to the pattern passed to the entry function.
let letters = []; // References to all of the wrapped letters on the page.
let interval = null; // an interval for updating the color which can be stopped.
let assignmentOffset = 0; // Place holder used to iterate over all the letters on the page.
let totalRange = 0;


/**
 * Evaluate each of the passed in line descriptions, and prepare the document to be ... played with.
 * @private
 */
const _init = function () {

    _calculateRanges(); // calculate the range of each line

    _cloneLetters(); // Clone all the letters you are going to use, wrapping the clones in a span tag

    _prepDocument(); // Adds styling to the page for the CSS transition

    _assignLetters(); // assign the letters to the document

    // Now that we have assigned all the letters to one line or another, figure out the interval for each line,
    // and create a plot for each line
    for (let j=0; j< lines.length; j++) {
        const line = lines[j];

        // Find the interval of each line based on the number of letters divided by the range:
        line.interval = line.range / line.numLetters;

        // For each function, invoke it for it's specified range along the specified interval:
        _createPlot(line);
    }
};

/**
 * Performs some basic math, allotting a 'range' to each of the lines in the pattern.
 * @private
 */
const _calculateRanges = function () {
    for (let n=0; n < lines.length; n++) {
        const line = lines[n];

        // First get the range of the line based on either the x or y boundaries:
        if (line.hasOwnProperty('xLower') && line.hasOwnProperty('xUpper')) {
            line.range = line.xUpper - line.xLower;
        } else if (line.hasOwnProperty('yLower') && line.hasOwnProperty('yUpper')) {
            line.range = line.yUpper - line.yLower;

            // If the line has no bounds, then throw an error.
        } else {
            throw new Error('You must include either x or y boundaries for each line configuration passed');
        }

        // Add a plot attribute to each line:
        lines[n].plot = [];

        // Add up the total range of all of the lines
        // used later on to figure out how many letters assigned to each line.
        // It's a crude solution that doesn't account for curvature in the lines, but the length or width of each
        // line is taken into account along the x or y access. This means lines straight up or across will have
        // proportionally more letters assigned to them.
        totalRange += lines[n].range;
    }
};

/**
 * Creates a style tag and appends it to the head with the given CSS string
 * @param str
 * @private
 */
const _createStyleTag = str => {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(str));
    head.appendChild(style);
};

/**
 * Preps the document to be manipulated. Removes all stylesheets and adds some base styling:
 * @private
 */
const _prepDocument = function () {

    const motionStyle = nodeClassName + '{' +
        'position: absolute;' +
        'transition: top 20s, left 20s, font-size 20s;' +
        'transform: translate3d(0,0,0); }';

    // next apply a motion style transform,
    _createStyleTag(motionStyle);
};

/**
 * Assigns the letters on the page to each of the lines in the pattern :
 * @private
 */
const _assignLetters = () => {

    const letterNum = letters.length;
    let totalLettersUsed = 0;

    // For each line, figure out how many letters should be assigned to that line:
    for (let i=0; i < lines.length; i++) {
        const line = lines[i];

        // The lines number of letters is the ratio of the lines range by the total range of all lines passed,
        // multiplied by the total number of letters in the document.
        line.numLetters = Math.floor(letterNum * (line.range / totalRange));
        totalLettersUsed += line.numLetters;
    }

    // Note * Since we are using Math.floor to calculate the numLetters - sometimes there will be a small remainder.
    // Check for this case and adjust by adding the remainder letters to the last line.
    if (letterNum !== totalLettersUsed) {
        lines[lines.length - 1].numLetters += (letterNum - totalLettersUsed);
    }
};

/**
 * Wrap each of the letters on the page in a span tag, and return a DOM reference to the letters on the page.
 * @private
 */
const _cloneLetters = function () {
    const body = document.getElementsByTagName('body')[0];

    // populates textNodes array :
    _getTextNodes(body);

    // for each text node, split into each letter, then for each letter, create a clone, append it to the parent
    // container.
    for (let i = 0; i < textNodes.length; i++) {

        const textArr = textNodes[i].nodeValue.split('');
        const parentElement = textNodes[i].parentElement;
        const removedNode = parentElement.removeChild(textNodes[i]);
        let previousInsertedEl = parentElement.firstChild;

        for (let x = 0; x < textArr.length; x++) {

            const newSpan = document.createElement('span');
            newSpan.setAttribute('class', nodeClass);
            newSpan.appendChild( document.createTextNode(textArr[x]) );
            parentElement.appendChild(newSpan);

            // now get the position for this element based on the position of the parent element (top and left)
            // combined with the position of the element relative to the parent container :
            newSpan.id = 'nerp-' + x;
            previousInsertedEl = newSpan;
        }

        // Next get the position of the placed element using getBoundingClientRect().
        // IMPORTANT! getBoundingClientRect considers the position of the element with regards to the body. It must
        // be in place in the document to get the position reliably. This is why we do this position step in a
        // subsequent loop, all the letters have to be in the right place first to get the correct position.
        // NOTE : Here we MUST use querySelectorAll or another method that returns a static list so we can iterate
        // over the elements in order.
        const newLetters = document.querySelectorAll('.' + nodeClass);
        for (let j = 0; j < newLetters.length; j++) {
            const letter = newLetters[j];
            const position = letter.getBoundingClientRect();

            letter.style.top = position.top + 'px';
            letter.style.left = position.left + 'px';
        }

        const docFrag = document.createDocumentFragment();
        for (let k = 0; k < newLetters.length; k++) {
            const letter = newLetters[k].parentElement.removeChild(newLetters[k]);
            letter.style.position = 'absolute';
            docFrag.appendChild(letter);
        }

        body.appendChild(docFrag);
        // *Note : Add back the removed node so this run doesn't affect positioning of subsquent loops
        parentElement.appendChild(removedNode);
    }

    // Now remove all the text nodes so that they arent' there under the copies of all the letters :
    for (let i = 0; i < textNodes.length; i++) {
        textNodes[i].parentElement.removeChild(textNodes[i]);
    }

    letters = document.getElementsByClassName(nodeClass);
};


/**
 * Via StackOverflow.
 * User:
 * http://stackoverflow.com/users/515502/rahat-ahmed
 */
const _getTextNodes = function(element) {
    // TODO !!! Only pick up text nodes from paragraphs, span tags, divs
    if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim() != '') {
        textNodes.push(element);

    } else if (element.childNodes.length > 0) {
        for (let i = 0; i < element.childNodes.length; i++) {
            _getTextNodes(element.childNodes[i]);
        }
    }
};

/**
 * Creates the (x,y) coordinates for each of the letters in a given line based on the passed line configurations,
 * and the leg work done above.
 * Assigns the (x,y) coordinates to the letters allotted to the given line.
 * @param line
 * @private
 */
const _createPlot = function(line) {
    const numLetters = line.numLetters;
    const interval = line.interval;
    const lower = line.hasOwnProperty('xLower') ? line.xLower : line.yLower;
    const equation = line.equation;
    const bodyHeight = document.getElementsByTagName('body')[0].offsetHeight;
    const bodyWidth = document.getElementsByTagName('body')[0].offsetWidth;

    // Now plot the points on the line based on the lower bound and the interval:
    for (let x = 0; x < numLetters; x++) {

        const x1 = lower + (x * interval);
        const y = equation(x1);
        // now find the coordinates relative to the width of the document, expecting that 0 is the midline of the
        // document on both the x and y axis
        const relativeX = x1 + (bodyWidth / 2);
        const relativeY = y + (bodyHeight / 2);

        const coordinates = [relativeX,relativeY];
        line.plot.push(coordinates);

        // use assignmentOffset so your place is held as _createPlot gets called on subsequent lines
        letters[assignmentOffset].plotPoint = coordinates;
        assignmentOffset++;
    }
};


/**
 * Start moving the letters on the page according to CSS transitions, then according to an interval which will
 * flash all the letters different colors.
 */
const startMoving = function () {

    for (let i=0; i < letters.length; i++) {
        const letter = letters[i];
        letter.style.left = letter.plotPoint[0] + 'px';
        letter.style.top = letter.plotPoint[1] + 'px';
        letter.style.fontSize = '20px';
    }

    // Increase the font size (this is a transition as stated above which is why it's done in a subsequent loop)
    for (let j=0; j < letters.length; j++) {
        letters[j].style.fontSize = '100px';
    }
};

// Generate a new random RGB color.
const newNum = () => Math.floor(Math.random() * 256);
const _newColor = () => 'rgb('+ newNum()  +','+ newNum() +','+ newNum() +')';

/**
 * Set an interval to flash a different color every half second.
 */
const flashColors = function () {

    const flash = () => {
        for (let k = 0; k < letters.length; k++) {
            letters[k].style.color = _newColor();
        }
    };

    flash();
    interval = setInterval(flash, 1000);
};

/**
 * Stop flashing letter colors.
 */
const stopFlashing = function () {
    clearInterval(interval);
};


module.exports = function (pattern) {
    if (!pattern) {
        throw new Error('You cannot use the LetterArranger without an an array of objects describing the pattern.');
    }
    lines = pattern;
    _init();
    startMoving();
    flashColors();
};
