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


let lines; // a reference to the pattern passed to the entry function.
let letters = []; // References to all of the wrapped letters on the page, and all the text nodes on the page:
const textNodes = [];
let letterNum = null; // The number of letters on the page:
let interval = null; // an interval for updating the color which can be stopped.
let bodyHeight = null; // The width and height of the body document that you are dealing with.
let bodyWidth = null;
let totalLettersUsed = 0; // The total letters assigned to a line:
let assignmentOffset = 0; // Place holder used to iterate over all the letters on the page.
const nodeClass = 'nerp';
const nodeClassName = '.' + nodeClass;

// Generate a new random RGB color.
const newNum = () => {
    return Math.floor(Math.random() * 256);
};
const _newColor = function() {
    const color = 'rgb('+ newNum()  +','+ newNum() +','+ newNum() +')';
    return color;
};


/**
 * Evaluate each of the passed in line descriptions, and prepare the document to be ... played with.
 * @private
 */
const _init = function() {
    let totalRange = 0;

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

    // Clone all the letters you are going to use, the wrap the clones in a span tag
    letters = _cloneLetters();

    // Set the x y default position of each of the letters.
    // Remove stylesheets and Add base styling to make this all possible:
    _prepDocument();

    letterNum = letters.length;

    // For each line, figure out how many letters should be assigned to that line:
    for (let i=0; i < lines.length; i++) {
        const linea = lines[i];

        // The lines number of letters is the ratio of the lines range by the total range of all lines passed,
        // multiplied by the total number of letters in the document.
        linea.numLetters = Math.floor(letterNum * (linea.range / totalRange));
        totalLettersUsed += linea.numLetters;
    }

    // Note * Since we are using Math.floor to calculate the numLetters - sometimes there will be a small remainder.
    // Check for this case and adjust:
    if (letterNum !== totalLettersUsed) {

        // Add the remainder letters to the last line:
        lines[lines.length - 1].numLetters += (letterNum - totalLettersUsed);
        totalLettersUsed += (letterNum - totalLettersUsed);
    }

    // Now that we have assigned all the letters to one line or another, figure out the interval for each line,
    // and create a plot for each line.
    for (let j=0; j< lines.length; j++) {
        const lineb = lines[j];

        // Find the interval of each line based on the number of letters divided by the range:
        lineb.interval = lineb.range / lineb.numLetters;

        // For each function, invoke it for it's specified range along the specified interval:
        _createPlot(lineb);
    }

    return this;
};

const _setStyleString = str => {
    const style = $('<style type="text/css">'+ str +'</style>');
    $('html > head').append(style);
};

/**
 * Preps the document to be manipulated. Removes all stylesheets and adds some base styling:
 * @private
 */
    // TODO !!! THIS DOES NOT WORK THE WAY I WANT IT TO AT ALL!!!!!!
    // IT SHOULD WRAP THE DIVS, NOT REMOVE THEM THEN REPLACE THEM, AND USE RELATIVE POSITIONING.
const _prepDocument = function() {
    const motionStyle = nodeClassName + '{' +
        'position: absolute;' +
        'transition: top 20s, left 20s, font-size 20s;' +
        'transform: translate3d(0,0,0); }';

    // for each letter, set the top and left position
    $(nodeClassName).each(function(){
        const position = $(this).offset();
        $(this).css({left : position.left + 'px', top : position.top + 'px'});
    });

    // next apply a motion style transform,
    _setStyleString(motionStyle);

    // Now select all of the cloned letter elements on the page, and remove them temporarily:
    const $clonedLetters = $(nodeClassName).detach();

    // remove everything from the body (including stylesheets), then re-attach the nerps.
    $('body').empty();
    $('body').append($clonedLetters);
    $('link').remove();

    // set a transition for visibility on all div elements
    //_setStyleString('div { transition: visibility: 5s;}');// can't figure out why this used to be here ...
    bodyWidth = document.getElementsByTagName('body')[0].offsetWidth;
    bodyHeight = document.getElementsByTagName('body')[0].offsetHeight;
};


/**
 * Wrap each of the letters on the page in a span tag, and return a DOM reference to the letters on the page.
 * @private
 */
const _cloneLetters = function() {
    const body = document.getElementsByTagName('body')[0];

    // populates textNodes array :
    _getTextNodes(document.getElementsByTagName('body')[0]);

    // for each text node, split into each letter, then for each letter, create your clone :
    for (let i = 0; i < textNodes.length; i++){

        const textArr = textNodes[i].nodeValue.split('');
        const parentElement = textNodes[i].parentElement;
        const position = parentElement.getBoundingClientRect();

        // TODO ::: !!!!!!!!!!!!!!!!!!!!!!!!!!
        // the positioning for these letters doesn't exactly work because we are only getting the offset of the
        // paretn element.
        // you cannot get the offset of the letter becaues the browser doesn't have this information, each node has
        // info on positioning, but each letter is not a node.
        // to get around this, we are going to clone EVERY letter, then for every letter cloned, wrap in a span (as I
        // am already) and put it in the same container element with the nodes that are already there - then get the
        // offset positioning relative to the parent. Since the span adds no additional styling, it should be exactly
        // the same offset (relative to the parent element) that the letter inside would be. Add this number to the
        // offset posotioning of the parent relative to the window, obtained from getBoundingClientRect(). 


        for (let x = 0; x < textArr.length; x++) {

            if (textArr[x] !== ' ') { // Check the string is not a space :
                const newSpan = document.createElement('span');
                newSpan.setAttribute('class', nodeClass);
                newSpan.appendChild( document.createTextNode(textArr[x]) );

                // set the positioning of the new clone letter :
                newSpan.style.position = 'absolute';
                newSpan.style.top = position.top + 'px';
                newSpan.style.left = position.left + 'px';
                body.appendChild( newSpan, textArr[x]);
            }
        }
    }

    return document.getElementsByClassName(nodeClass);
};


/**
 * Via StackOverflow.
 * User:
 * http://stackoverflow.com/users/515502/rahat-ahmed
 */
const _getTextNodes = function(element) {

    // Don't recurse into scripts, kill 'em.
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
 * Stop the dance.
 */
const stop = function() {
    clearInterval(interval);
};

/**
 * Start moving the letters on the page according to CSS transitions, then according to an interval which will
 * flash all the letters different colors.
 */
const startMoving = function() {

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

    // Set an interval to flash a different color every half second.
    interval = setInterval(function(){

        for (let k = 0; k < letters.length; k++) {
            letters[k].style.color = _newColor();
        }

    }, 5000); // TODO !!! determine whether 5 seconds is the proper timeout.

};



module.exports = function (pattern) {
    if (!pattern) {
        throw new Error('You cannot use the LetterArranger without an an array of objects describing the pattern.');
    }
    lines = pattern;
    _init();
    startMoving();
};
