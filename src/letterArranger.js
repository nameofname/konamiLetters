/**
 * Takes an array of line objects. Each line must have an upper and lower bound (for x OR y) and a function that
 * describes the relationship between x and y.
 *
 * Here are some examples of line configurations:
 *      {
 *          xLower : -10,
 *          xUpper : 10,
 *          equation : function (x) { return x + 1}
 *      }, {
 *          yLower : -20,
 *          yUpper : 20,
 *          equation : function (x) { return x + 1}
 *      }
 *
 * Note* A line configuration cannot have both x and y boundaries.
 *
 * Using the public methods of the letter arranger, you will be able to re-arrange all the letters on the page to match
 * the lines you describe.
 *
 * @param lines
 */
var LetterArranger = function(lines) {
    "use strict";

    var self = this;

    if (!lines) {
        throw new Error('You cannot initialize the LetterArranger without an array of lines.');
    }

    this.lines = lines;

    // References to all of the wrapped letters on the page, and all the text nodes on the page:
    this.letters = [];
    this.textNodes = [];
    // The number of letters on the page:
    this.letterNum = null;
    // The offset for the current letter being assinged a point - starting at 0 and used as a place holder for when
    // iterating through all the letters on the page.
    this.assignmentOffset = 0;
    // A reference to the dancing letters interval:
    this.interval = null;
    // The width and height of the body document that you are dealing with.
    this.bodyHeight = null;
    this.bodyWidth = null;
    // The total letters assigned to a line: 
    this.totalLettersUsed = 0;
    // An array of the keys pressed (to listen for the konami code):
    this.keysPressed = [];
    this.konamiSeries = [38,38,40,40,37,39,37,39,66,65];
    this.currKonamiIndex = 0;


    /**
     * Evaluate each of the passed in line descriptions, and prepare the document to be ... played with.
     * @private
     */
    this.init = function() {
        var totalRange = 0;

        for (var n=0; n<this.lines.length; n++) {
            var line = this.lines[n];

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
            this.lines[n].plot = [];

            // Add up the total range of all of the lines:
            totalRange += this.lines[n].range;
        }

        // Wrap all the letters in a span tag and get the returned list.
        this.letters = this._wrapLetters();

        // Set the x y default position of each of the letters.
        this._positionLetters();

        // Remove stylesheets and Add base styling to make this all possible:
        this._prepDocument();

        this.letterNum = this.letters.length;

        // For each line, figure out how many letters should be assigned to that line:
        for (var i=0; i< this.lines.length; i++) {
            var linea = this.lines[i];

            // The lines number of letters is the ratio of the lines range by the total range of all lines passed,
            // multiplied by the total number of letters in the document.
            linea.numLetters = Math.floor(this.letterNum * (linea.range / totalRange));
            this.totalLettersUsed += linea.numLetters;
        }

        // Note * Since we are using Math.floor to calculate the numLetters - sometimes there will be a small remainder.
        // Check for this case and adjust:
        if (this.letterNum !== this.totalLettersUsed) {

            // Add the remainder letters to the last line:
            this.lines[this.lines.length - 1].numLetters += (this.letterNum - this.totalLettersUsed);
            this.totalLettersUsed += (this.letterNum - this.totalLettersUsed);
        }

        // Now that we have assigned all the letters to one line or another, figure out the interval for each line,
        // and create a plot for each line.
        for (var j=0; j< this.lines.length; j++) {
            var lineb = this.lines[j];

            // Find the interval of each line based on the number of letters divided by the range:
            lineb.interval = lineb.range / lineb.numLetters;

            // For each function, invoke it for it's specified range along the specified interval:
            this._createPlot(lineb);
        }
    };

    /**
     * Preps the document to be manipulated. Removes all stylesheets and adds some base styling:
     * @private
     */
    this._prepDocument = function() {
        $('link').remove();

        var styles = '';
        styles += '<style>';
        styles += 'html { min-height: 100%;}';
        styles += 'body { position : absolute; min-width : 100%; min-height: 100%;}';
        styles += 'div { transition: visibility: 5s;}';
        styles += '</style>';

        var style = $(styles);
        $('html > head').append(style);

        var width = document.getElementsByTagName('body')[0].offsetWidth;
        var height = document.getElementsByTagName('body')[0].offsetHeight;

        this.bodyHeight = height;
        this.bodyWidth = width;
    };

    /**
     * @private
     */
    this._positionLetters = function(){

        $('.nerp').each(function(){

            var position = $(this).offset();
            $(this).data('top', position.top);
            $(this).data('left', position.left);

            $(this).css({left : $(this).data('left') + 'px', top : $(this).data('top')+ 'px'});
        });

        var styles = '';
        styles += '<style>';
        styles += '.nerp { position: absolute; transition: top 20s, left 20s, font-size 20s; transform: translate3d(0,0,0); }';
        styles += '</style>';

        var style = $(styles);
        $('html > head').append(style);

        // Now select all of the .nerp elements on the page, and remove them temporarily:
        var $nerps = $('.nerp').detach();
        $('body').empty();
        $('body').append($nerps);
    };


    /**
     * Wrap each of the letters on the page in a span tag, and return a DOM reference to the letters on the page.
     * @private
     */
    this._wrapLetters = function() {
        this._getTextNodes(document.getElementsByTagName('body')[0]);
        var nodeList = this.textNodes;

        for (var i=0; i<nodeList.length; i++){
            var textArr = nodeList[i].nodeValue.split(''),
                parentElement = nodeList[i].parentElement;

            parentElement.removeChild(nodeList[i]);
            for (var x=0; x<textArr.length; x++) {

                // Do a double check here for empty string text nodes (do not use the empty strings in between
                // other full strings):
                if (textArr[x] !== ' ') {
                    var newSpan = document.createElement('span');

                    newSpan.setAttribute('class', 'nerp');

                    newSpan.appendChild( document.createTextNode(textArr[x]) );
                    parentElement.appendChild( newSpan, textArr[x]);
                }
            }
        }

        return document.getElementsByClassName('nerp');
    };


    /**
     * Via StackOverflow.
     * User:
     * http://stackoverflow.com/users/515502/rahat-ahmed
     */
    this._getTextNodes = function(element) {

        // Don't recurse into scripts, kill 'em.
        if (element.tagName === 'SCRIPT') {
            element.remove();
        } else {
            if (element.childNodes.length > 0) {
                for (var i = 0; i < element.childNodes.length; i++) {
                    self._getTextNodes(element.childNodes[i]);
                }
            }

            if (element.nodeType === Node.TEXT_NODE && element.nodeValue.trim() != '') {
                self.textNodes.push(element);
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
    this._createPlot = function(line) {
        var numLetters = line.numLetters,
            interval = line.interval,
            lower = line.hasOwnProperty('xLower') ? line.xLower : line.yLower,
            equation = line.equation;

        // Now plot the points on the line based on the lower bound and the interval:
        for (var x=0; x < numLetters; x++) {
            var x1 = lower + (x * interval),
                y = equation(x1),

            // now find the coordinates relative to the width of the document, expecting that 0 is the midline of the
            // document on both the x and y axis
                relativeX = x1 + (this.bodyWidth / 2),
                relativeY = y + (this.bodyHeight / 2);

            var coordinates = [relativeX,relativeY];
            line.plot.push(coordinates);

            this.letters[this.assignmentOffset].plotPoint = coordinates;
            this.assignmentOffset++;
        }
    };


    /**
     * Stop the dance.
     */
    this.stop = function() {
        clearInterval(this.interval);
    };

    /**
     * Start moving the letters on the page according to CSS transitions, then according to an interval which will
     * flash all the letters different colors.
     */
    this.startMoving = function() {

        var letters = self.letters;
        for (var i=0; i<letters.length; i++) {
            var letter = letters[i];

            letter.style.left= letters[i].plotPoint[0] + 'px';
            letter.style.top = letters[i].plotPoint[1] + 'px';
            letter.style.fontSize = '20px';

//            letter.addEventListener('webkitTransitionEnd', function(){
//                letter.style.fontSize = '100px';
//            }, true);
        }

        setTimeout(function(){

            // Increase the font size (this is a transition as stated above)
            for (var j=0; j<letters.length; j++) {
                var letter = letters[j];
                letter.style.fontSize = '100px';
            }

            // Set an interval to flash a different color every half second.
            self.interval = setInterval(function(){

                for (var k=0; k<letters.length; k++) {
                    var letter = letters[k];
                    letter.style.color = self._newColor();
                }

            }, 500);

        }, 20000);

    };

    /**
     * Generate a new random RGB color.
     */
    this._newColor = function() {
        var color = 'rgb('+ newNum()  +','+ newNum() +','+ newNum() +')';
        function newNum() {
            return Math.floor(Math.random() * 256);
        }
        return color;
    };

    this.konami = function() {
        document.onkeydown = function(e) {
            var key = e.which;

            self.konamiSeries = [38,38,40,40,37,39,37,39,66,65];

            // If the key pressed was the next in the konami series,
            if (self.konamiSeries[self.currKonamiIndex] === key) {
                self.keysPressed.push(key);
                self.currKonamiIndex+=1;
            } else {
                if (self.konamiSeries[0] === key) {
                    self.keysPressed = [key];
                    self.currKonamiIndex = 1;
                } else {
                    self.keysPressed = [];
                    self.currKonamiIndex = 0;
                }
            }

            // Now test for a complete match:
            if (self.konamiSeries.join('-') === self.keysPressed.join('-')) {
                self.init();
                setTimeout(function(){
                    self.startMoving();
                }, 1000);
                self.startMoving();
            }
        };
    };

    return this;
};


module.exports = LetterArranger;