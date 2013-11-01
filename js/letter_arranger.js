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
var letter_arranger = function(lines) {

    var self = this;

    this.lines = lines;

    // This will be a reference to all of the wrapped letters on the page.
    this.letters = null;
    // The number of letters on the page:
    this.letterNum = null;
    // The offset for the current letter being assinged a point - starting at 0 and used as a place holder for when
    // iterating through all the letters on the page.
    this.assignmentOffset = 0;
    // A reference to the dancing letters interval:
    this.interval = null;

    /**
     * Evaluate each of the passed in line descriptions, and prepare the document to be ... played with.
     * @private
     */
    this._init = function() {
        var totalRange = 0;

        for (var n=0; n<this.lines.length; n++) {
            var line = this.lines[n];

            // First get the range of the line based on either the x or y boundaries:
            if (line.hasOwnProperty(xLower) && line.hasOwnProperty(xUpper)) {
                line.range = line.xUpper - line.xLower;
            } else if (line.hasOwnProperty(yLower) && line.hasOwnProperty(yUpper)) {
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
        this.letterNum = this.letters.length;

        // For each line, figure out how many letters should be assigned to that line:
        for (var i=0; i< this.lines.length; i++) {
            var line = this.lines[i];

            // The lines number of letters is the ratio of the lines range by the total range of all lines passed,
            // multiplied by the total number of letters in the document.
            // TODO!!! VALIDATE THIS ASSUMPTION!
            line.numLetters = Math.floor(this.letterNum * (line.range / totalRange));
            console.log('found the num of letters for this line', line.numLetters);

            // Find the interval of the line based on the number of letters divided by the range:
            line.interval = line.numLetters / line.range;

            // For each function, invoke it for it's specified range along the specified interval:
            this._createPlot(line);
        }

        // Now divide the letters among each of the lines:
        this.letters.each(function(){
            // AAAAAAAAAAAAAAAAAAAAAAAAAAA!!!!!!!!!!!!
        });

    }

    /**
     * Wrap each of the letters on the page in a span tag, and return a DOM reference to the letters on the page.
     * @private
     */
    this._wrapLetters = function() {

        var nodeList = [],
            treeWalker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

        while(treeWalker.nextNode()) {
            nodeList.push(treeWalker.currentNode);
        }

        for (var i=0; i<nodeList.length; i++){
            var textArr = nodeList[i].nodeValue.split(''),
                parentElement = nodeList[i].parentElement;

            parentElement.removeChild(nodeList[i]);
            for (var x=0; x<textArr.length; x++) {
                var newSpan = document.createElement('span');

                newSpan.setAttribute('class', 'nerp');
                newSpan.style.position = 'relative';
                newSpan.style.top = '0px';
                newSpan.style.left = '0px';

                newSpan.appendChild( document.createTextNode(textArr[x]) );
                parentElement.appendChild( newSpan, textArr[x]);
            }
        }

        return document.getElementsByClassName('nerp');
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
        for (var x=lower; x<= numLetters; x++) {
            x1 = x * interval;
            y = equation(x1);

            var coordinates = [x,y];
            line.plot.push(coordinates);

            this.letters[this.assignmentOffset].plotPoint = coordinates;
            this.assignmentOffset++;
        }
    }


    /**
     * Makes all the letters on the page dance moving closer to their coordinates:
     */
    this.startDancing = function() {
        this.interval = setInterval(function(){
            var letters = this.letters;

            for (var i=0; i<letters.length; i++) {

                var letter = letter[i],
                    currX, currY, targetX, targetY, newX, newY;

                currX = parseIn(letter.style.left.split('px')[0]);
                currY = parseIn(letter.style.left.split('px')[0]);

                targetX = parseIn(letter.plotPoint[0]);
                targetY = parseIn(letter.plotPoint[1]);
                newX = currX < = targetX ? (currX + 5) : (currX - 5);
                newY = currY < = targetY ? (currY + 5) : (currY - 5);

//                if (Math.random(0,10) > .5) {
//                    x = parseInt(x) + 2;
//                } else {
//                    x = parseInt(x) - 2;
//                }
//                if (Math.random(0,10) > .5) {
//                    y = parseInt(y) + 2;
//                } else {
//                    y = parseInt(y) - 2;
//                }

                letter.style.color = self._newColor();
                letter.style.bottom = newY+'px';
                letter.style.left = newX+'px';
            }
        },300);

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


