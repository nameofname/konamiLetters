babel src -d lib;
babel src/patterns -d patterns;
browserify -s konamiLetters lib/konamiLettersEntry.js > lib/konamiLetters.js;
echo "window.konamiLetters = require('./lib/konamiLetters');" > tmp-browserVersion.js;
browserify tmp-browserVersion.js > dist/browserVersion.js;
rm tmp-browserVersion.js;
mv lib/konamiLetters.js dist/
