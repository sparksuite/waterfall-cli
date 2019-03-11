// Dependencies
const path = require('path');
const utils = require('./utils.js');


// Default settings
module.exports = {
	app: {
		name: null,
		version: null,
	},
	arguments: utils({}).processArguments(process.argv),
	mainFilename: require.main.filename,
	onStart: null,
	packageFilePath: '../package.json',
	spacing: {
		before: 1,
		after: 1,
	},
	usageCommand: `node ${path.basename(require.main.filename)}`,
	verbose: false,
};
