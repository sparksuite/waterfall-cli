// Imports
import chalk from '../utils/chalk.js';
import getConfig from '../utils/get-config.js';

/** Return the content of the version info screen */
export default async function versionScreen(): Promise<string> {
	// Get the config
	const config = await getConfig();

	// Initialize
	let outputString = '';

	// Add name, if we have one, with colon, if necessary
	if (config.displayName || config.packageName) {
		outputString += chalk.bold(`${String(config.displayName || config.packageName)}${config.version ? ': ' : ''}`);
	}

	// Add version (if we have one)
	if (config.version) {
		outputString += config.version;
	}

	// Return
	return outputString;
}
