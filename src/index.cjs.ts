// Export directly
import init from './actions/init.js';
export { default as printError } from './utils/print-pretty-error.js';

// Export as default
// import { init, parse } from './waterfall-cli.js';
import printError from './utils/print-pretty-error.js';

export default {
	init,
	// parse,
	printError,
};

// Expose some types to consumers
// export type { default as CommandSpec } from '../ignore/types/command-spec';
// export type { default as Settings } from '../ignore/types/settings';
