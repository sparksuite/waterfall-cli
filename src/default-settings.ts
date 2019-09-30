export {};

// Dependencies
const path = require('path');
const utils = require('./utils.js');

import { AppSettings } from './utils.js';

interface SpacingSettings {
	after: number;
	before: number;
}

interface NewVersionWarningSettings {
	enabled: boolean;
	installedGlobally: boolean;
}

interface Settings {
	app: AppSettings;
	arguments: string[];
	mainFilename: string;
	newVersionWarning: NewVersionWarningSettings;
	onStart: string | null;
	packageFilePath: string;
	spacing: SpacingSettings;
	usageCommand: string;
	verbose: boolean;
}

// Default Settings
const settings: Settings = {
	app: {
		name: null,
		packageName: null,
		version: null,
	},
	arguments: utils({}).processArguments(process.argv),
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
module.exports = settings;
