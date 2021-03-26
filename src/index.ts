// Export directly
export { default as init } from './actions/init.js';
export { default as printError } from './utils/print-pretty-error.js';
export { PrintableError } from './utils/errors.js';

// Export as default
import init from './actions/init.js';
import printError from './utils/print-pretty-error.js';
import { PrintableError } from './utils/errors.js';

export default {
	init,
	// parse,
	printError,
	PrintableError,
};

// Expose some types to consumers
export type { CommandSpec } from './utils/get-command-spec';
export type { default as CommandFunction } from './types/command-function';
