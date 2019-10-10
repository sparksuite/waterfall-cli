// Dependencies
import path from 'path';
import processArguments from './process-arguments';
import { Settings } from './types';

// Default Settings
const settings: Settings = {
	app: {},
	arguments: processArguments(process.argv),
	mainFilename: process.argv[1],
	newVersionWarning: {
		enabled: false,
		installedGlobally: true,
	},
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
