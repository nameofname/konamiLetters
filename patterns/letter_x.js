var letter_x = [
    {
        xLower : -200,
        xUpper : 200,
        equation : function(x) {
            return x;
        }
    }, {
        yLower : -200,
        yUpper : 200,
        equation : function(x) {
            return (-1 * x);
        }
    }
];

module.exports = letter_x;
