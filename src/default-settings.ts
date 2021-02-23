// Dependencies
import fs from 'fs';
import path from 'path';
import processArguments from './process-arguments.js';
import type { Settings } from './types';

// Default Settings
const settings: Settings = {
	app: {},
	arguments: processArguments(process.argv),
	mainFilename: fs.realpathSync(process.argv[1]),
	newVersionWarning: {
		enabled: false,
		installedGlobally: true,
	},
	packageFilePath: '../package.json',
	spacing: {
		before: 1,
		after: 1,
	},
	usageCommand: `node ${path.basename(fs.realpathSync(process.argv[1]))}`,
	verbose: false,
};

// Export
export default settings;
