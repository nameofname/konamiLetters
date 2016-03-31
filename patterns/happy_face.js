var happy_face = [
    // this one is the smile
    {
        xLower : -250,
        xUpper : 250,
        equation : function(x) {
            x = parseInt(x);
            var y = Math.sqrt(62500 - (x * x));
            return y;
        }

    // The top and bottom of the left eye
    }, {
        xLower : -215,
        xUpper : -185,
        equation : function(x) {
            x = parseInt(x);
            var y = Math.sqrt(225 - Math.pow((x + 200), 2)) - 200;
            return y;
        }
    }, {
        xLower : -215,
        xUpper : -185,
        equation : function(x) {
            x = parseInt(x);
            var y = -1 * Math.sqrt(225 - Math.pow((x + 200), 2)) - 200;
            return y;
        }

    // The top and bottom of the RIGHT eye
    }, {
        xLower : 185,
        xUpper : 215,
        equation : function(x) {
            x = parseInt(x);
            var y = Math.sqrt(225 - Math.pow((x - 200), 2)) - 200;
            return y;
        }
    }, {
        xLower : 185,
        xUpper : 215,
        equation : function(x) {
            x = parseInt(x);
            var y = -1 * Math.sqrt(225 - Math.pow((x - 200), 2)) - 200;
            return y;
        }
    }
];

module.exports = happy_face;
