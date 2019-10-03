// declare function waterfallCLI(customSettings: any, ...args: any[]): void
// declare function waterfallCLI(customSettings: { verbose: boolean }, ...args: string[]): void

// Import and initialize Waterfall CLI
import waterfallCLI from '../../../../dist/index.js';

waterfallCLI({
	verbose: true,
});
