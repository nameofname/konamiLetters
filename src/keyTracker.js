"use strict";

// Key array defaults to the konami code :
const defaultSeries = [38,38,40,40,37,39,37,39,66,65];

// find the matching segment to the character array at the end of the current array
// eg. if your character array is 1, 2, 3, and your current array is 1, 1, 2, you want to match on 1, 2
const findMatchingSegment = (charArr, currArr) => {

    if (currArr.length === 0) {
        return currArr;
    }

    let mismatchIdx;
    let i = 0;
    while (i < currArr.length) {
        if ((currArr[i] !== charArr[i])) {
            mismatchIdx = i;
        }
        i++;
    }

    if (mismatchIdx !== undefined) {
        console.log('here : ', charArr, currArr, mismatchIdx)
        return findMatchingSegment(charArr, currArr.splice(mismatchIdx, currArr.length));
    } else {
        return currArr;
    }
};

module.exports = (charArr, callback) => {
    let currArr = [];
    charArr = charArr || defaultSeries;

    document.addEventListener('keypress', (e) => {
        currArr.push(e.which);

        if (e.which !== charArr[currArr.length - 1]) {
            currArr = findMatchingSegment(charArr, currArr);
        }

        if (currArr.length === charArr.length) {
            if (callback && (typeof callback === 'function')) {
                callback();
            }
            currArr.length = 0;
        }

    });
};