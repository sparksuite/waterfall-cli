// Imports
import { init, parse } from './waterfall-cli.js';
import printError from './print-pretty-error.js';

// Default export
export default {
    init,
    parse,
    printError,
};

// Expose some types to consumers
export type { Settings, CommandSpec } from './types';
