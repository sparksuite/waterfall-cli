export {};

// Dependencies
const path = require('path');
const utils = require('./utils.js');

// interface AppSettings {
// 	name: string | null;
// 	packageName: string | null;
// 	version: string | null;
// 	[propName: string]: any;
// }

// interface NewVersionWarning {
// 	enabled: boolean;
// 	installedGlobally: boolean;
// }

// interface SpacingSettings {
// 	before: number;
// 	after: number;
// }

// // @ts-ignore TS6196 - seems to think this is never used.
// interface Settings {
// 	app: AppSettings;
// 	arguments: any;
// 	mainFilename: string;
// 	newVersionWarning: NewVersionWarning;
// 	onStart: string | null;
// 	packageFilePath: string;
// 	spacing: SpacingSettings;
// 	usageCommand: string;
// 	verbose: boolean;
// }

// Default Settings
const settings: Settings = {
	app: {
		name: null,
		packageName: null,
		version: null,
	},
	arguments: utils({}).processArguments(process.argv),
	//mainFilename: __filename,
	//mainFilename: req.main.filename,
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
	//usageCommand: `node ${path.basename(__filename)}`,
	//usageCommand: `node ${path.basename(req.main.filename)}`,
	usageCommand: `node ${path.basename(process.argv[1])}`,
	verbose: false,
};

// Export
module.exports = settings;
