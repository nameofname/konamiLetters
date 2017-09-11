"use strict";

// Key array defaults to the konami code :
const defaultSeries = [38,38,40,40,37,39,37,39,66,65];

/**
 * This private function gets called when the last character just added to the array doesn't match the corresponding
 * character in the array you are matching against.
 * In this case (you have a mismatch), part of what was typed might still match the beginning of the character
 * array. for example consider :
 * charArr = [a, b, a, b, c];
 * currArr = [a, b, a, b, a];
 * in this case you can still keep [a, b, a] from the end of currArr, but you have to throw out [a, b] from the front
 *
 * Uses  recursion, take the case of :
 * charArr = [one me on]
 * currArr = [one me one]
 *
 * I would work backwards matching the e from "one" to the e from "me" - but that doesn't fit, i need to fall back again
 * until i hit the first e, from "one."
 * @param charArr
 * @param currArr
 * @param currI
 * @returns {*}
 */
const findMatchingSegment = (charArr, currArr, currI) => {

    const lastIdx = currArr.length - 1;
    currI = (typeof currI === 'number') ? currI : lastIdx;
    let highestMatchingIdx;
    while (currI > 0) {
        if (charArr[currI] === currArr[lastIdx]) {
            highestMatchingIdx = currI;
            currI = 0;
        }
        currI--;
    }

    if (!highestMatchingIdx) {
        return [];
    }

    let noViolations = true;
    let j = highestMatchingIdx;
    let k = lastIdx;
    while (j > 0) {
        if (charArr[j] !== currArr[k]) {
            j = 0;
            noViolations = false;
        }
        j--;
    }

    if (noViolations) {
        return currArr.splice((lastIdx - highestMatchingIdx + 1), lastIdx);
    } else {
        return findMatchingSegment(charArr, currArr, currI - 1);
    }

};

module.exports = (charArr, callback) => {
    let currArr = [];
    charArr = charArr || defaultSeries;

    document.addEventListener('keydown', (e) => {
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