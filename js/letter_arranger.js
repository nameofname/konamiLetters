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

    var self = this;

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

    /**
     * Evaluate each of the passed in line descriptions, and prepare the document to be ... played with.
     * @private
     */
    this.init = function() {
        var totalRange = 0;

        // Add base styling to make this all possible:
        this._prepDocument();

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
        // *Note - this is done in a separate step because if you apply the
        this._positionLetters();

        this.letterNum = this.letters.length;

        // For each line, figure out how many letters should be assigned to that line:
        for (var i=0; i< this.lines.length; i++) {
            var line = this.lines[i];

            // The lines number of letters is the ratio of the lines range by the total range of all lines passed,
            // multiplied by the total number of letters in the document.
            // TODO!!! VALIDATE THIS ASSUMPTION!
            line.numLetters = Math.floor(this.letterNum * (line.range / totalRange));

            // Find the interval of the line based on the number of letters divided by the range:
            line.interval = line.range / line.numLetters;

            // For each function, invoke it for it's specified range along the specified interval:
            this._createPlot(line);
        }
    }

    /**
     * Preps the document to be manipulated. Removes all stylesheets and adds some base styling:
     * @private
     */
    this._prepDocument = function() {
        $('link').remove();

        var styles = '';


        styles += '<style>';
        styles += '.nerp { position: absolute; } ';
//        styles += 'body { position : relative; width : '+ width +'; height : '+ height +';}';
        styles += 'body { position : relative; min-width : 100%; min-height: 100%;}';
        styles += '</style>';

        var style = $(styles);
        $('html > head').append(style);

        var width = document.getElementsByTagName('body')[0].offsetWidth;
        var height = document.getElementsByTagName('body')[0].offsetHeight;

        this.bodyHeight = height;
        this.bodyWidth = width;
    }

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
                var newSpan = document.createElement('span');

                newSpan.setAttribute('class', 'nerp');

                newSpan.appendChild( document.createTextNode(textArr[x]) );
                parentElement.appendChild( newSpan, textArr[x]);
            }
        }

        return document.getElementsByClassName('nerp');
    };


    /**
     * @private
     */
    this._positionLetters = function(){

        $('.nerp').each(function(){

            var position = $(this).position();
            $(this).data('top', position.top);
            $(this).data('left', position.left);

        });

        $('.nerp').each(function(){
            $(this).css({left : $(this).data('left') + 'px', top : $(this).data('top')+ 'px'});
        });

    }


    /**
     * Via StackOverflow.
     * User:
     * http://stackoverflow.com/users/515502/rahat-ahmed
     */
    this._getTextNodes = function(element) {
        if (element.childNodes.length > 0) {
            for (var i = 0; i < element.childNodes.length; i++) {
                self._getTextNodes(element.childNodes[i]);
            }
        }

        if (element.nodeType == Node.TEXT_NODE && element.nodeValue != '') {
            self.textNodes.push(element);
        }
    }

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
    }


    /**
     * Stop the dance.
     */
    this.stopDancing = function() {
        clearInterval(this.interval);
    }

    /**
     * Makes all the letters on the page dance moving closer to their coordinates:
     */
    this.startDancing = function() {
        this.interval = setInterval(function(){
            var letters = self.letters;

            for (var i=0; i<letters.length; i++) {

                var letter = letters[i],
                    currX, currY, targetX, targetY, newX, newY;

                currX = parseInt(letter.style.left.split('px')[0]);
                currY = parseInt(letter.style.top.split('px')[0]);

                targetX = parseInt(letter.plotPoint[0]);
                targetY = parseInt(letter.plotPoint[1]);
                newX = currX <= targetX ? (currX + 20) : (currX - 20);
                newY = currY <= targetY ? (currY + 20) : (currY - 20);

                letter.style.color = self._newColor();
                letter.style.top = newY+'px';
                letter.style.left = newX+'px';
            }
        },100);
    }

    this._newColor = function() {
        var color = 'rgb('+ newNum()  +','+ newNum() +','+ newNum() +')';
        function newNum() {
            return Math.floor(Math.random() * 256 - 1);
        }
        return color;
    }

    return this;
}



var arranger;

$(document).ready(function(){

    var lines = [
        {
            xLower : -200,
            xUpper : 200,
            equation : function(x) {
                return x;
            }
        }, {
            xLower : -200,
            xUpper : 200,
            equation : function(x) {
                return (-1 * x);
            }
        }
    ];

    arranger = new LetterArranger(lines);
    arranger.init();

});

