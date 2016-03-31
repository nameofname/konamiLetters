"use strict";


var LetterArranger = require('./letterArranger');
var keyTracker = require('./keyTracker');


$(document).ready(function () {

    var arranger = new LetterArranger(happy_face);
    keyTracker(undefined, function () {
        arranger.init();
        setTimeout(function(){
            arranger.startMoving();
        }, 1000);
        arranger.startMoving();
    });

});

