// Dependencies
const path = require('path');
const processArguments = require('./process-arguments.js');

// Default settings
module.exports = {
	app: {
		name: null,
		packageName: null,
		version: null,
	},
	arguments: processArguments(process.argv),
	mainFilename: process.argv[1],
	newVersionWarning: {
		enabled: true,
		installedGlobally: true,
	},
	onStart: null,
	packageFilePath: '../package.json',
	spacing: {
		before: 1,
		after: 1,
	},
	usageCommand: `node ${path.basename(process.argv[1])}`,
	verbose: false,
};
