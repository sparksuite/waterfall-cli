// Export directly
export { init, parse } from './waterfall-cli.js';
export { default as printError} from './print-pretty-error.js';

// Export as default
import { init, parse } from './waterfall-cli.js';
import printError from './print-pretty-error.js';

export default {
    init,
    parse,
    printError,
};

// Expose some types to consumers
export type { Settings, CommandSpec } from './types';
