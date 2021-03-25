// Imports
import chalk from '../utils/chalk.js';
import getConfig from '../utils/get-config.js';

/** Return the content of the version info screen */
export default async function versionScreen(): Promise<string> {
	// Get the config
	const config = await getConfig();

	// Initialize
	let outputString = '';

	// Add name, if we have one
	if (config.displayName) {
		outputString += chalk.bold(`${config.displayName}: `);
	}

	// Add version (if we have one) and a newline
	outputString += `${config.version || ''}\n`;

	// Add spacing after
	for (let i = 0; i < config.spacing.after; i += 1) {
		outputString += '\n';
	}

	// Return
	return outputString;
}
