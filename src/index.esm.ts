// Imports
import init from './actions/init.js';
import printError from './utils/print-pretty-error.js';
import { PrintableError } from './utils/errors.js';

// Default export
export default {
	init,
	// parse,
	printError,
	PrintableError,
};

// Expose some types to consumers
export type { CommandSpec } from './utils/get-command-spec';
