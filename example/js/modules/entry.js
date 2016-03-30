"use strict";

var LetterArranger = require('./letterArranger');
var keyTracker = require('./keyTracker');


$(document).ready(function () {
    "use strict";

    var arranger = new LetterArranger(happy_face);
    keyTracker(undefined, function () {
        arranger.init();
        setTimeout(function(){
            arranger.startMoving();
        }, 1000);
        arranger.startMoving();
    });

    // This is only for the example so I can play in the console.
    window.arranger = arranger;
});

