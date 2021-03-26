// Imports
import chalk from './chalk.js';
import getConfig from './get-config.js';

/** Prints a verbose message, if the verbose is enabled in the config */
export default async function verboseLog(message: string): Promise<void> {
	// Get the config
	const config = await getConfig();

	// Print if allowed
	if (config.verbose) {
		console.log(chalk.dim.italic(`[VERBOSE] ${message}`));
	}
}
