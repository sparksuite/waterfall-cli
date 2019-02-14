// Dependencies
const utils = require('./utils.js');


// Default settings
module.exports = {
	app: {
		name: null,
		version: null,
	},
	arguments: utils({}).processArguments(process.argv),
	mainFilename: require.main.filename,
	packageFilePath: '../package.json',
	verbose: false,
};
