"use strict";

// Key array defaults to the konami code :
const defaultSeries = [38,38,40,40,37,39,37,39,66,65];
// An array of the keys pressed (to listen for the konami code):
let keysPressed = [];
let currIndex = 0;

const keyTracker = (keyArray, callback) => {
    document.onkeydown = function(e) {
        const key = e.which;

        keyArray = keyArray || defaultSeries;

        // If the key pressed was the next in the series, push it to the array of pressed letters :
        if (keyArray[currIndex] === key) {
            keysPressed.push(key);
            currIndex+=1;

            // if the key pressed does not match the current, then start over :
        } else {

            keysPressed = [];
            currIndex = 0;

            if (keyArray[0] === key) {
                keysPressed.push(key);
                currIndex+=1;
            }
        }

        // Now test for a complete match:
        if (keysPressed.length === keyArray.length) {
            callback();
        }

        //if (keyArray.join('-') === keysPressed.join('-')) {
        //    self.init();
        //    setTimeout(function(){
        //        self.startMoving();
        //    }, 1000);
        //    self.startMoving();
        //}
    };
};

