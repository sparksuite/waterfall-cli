// Dependencies
import path from 'path';
import { Settings } from './index';
import processArguments from './process-arguments';

// Default Settings
const settings: Settings = {
	app: {},
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

// Export
export default settings;
