"use strict"; 

var path = require("path");

module.exports = {
	entry: {
        konamiLetters : path.resolve(__dirname, './src/konamiLettersEntry.js'),
        konamiLettersBrowser : path.resolve(__dirname, './src/konamiLettersBrowser.js')
    },
    output : {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
        //path: path.resolve(__dirname, './dist'),
        //filename: 'konamiLetters.js',
        //sourceMapFilename: './dist/[file].map'
    },
	// module: {
     //    loaders: [
     //        {
     //            test: /.js/,
     //            exclude: /(node_modules)/,
     //            loader: 'babel',
     //            query: {
     //                presets: ['es2015', 'stage-2']
     //            }
     //        }
     //    ]
	// },
    recordsOutputPath: path.join(__dirname, "/dist/records.json")
};
